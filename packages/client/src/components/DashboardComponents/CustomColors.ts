import { DoughnutController, type Chart, type ChartDataset, type Plugin } from "chart.js";
type CustomColorsPluginOptions = {
    enabled?: boolean;
};
type ColorDefinition = {
    color: string;
    backgroundColor: string;
} | string;

const customColorPlugin: (colors: ColorDefinition[]) => Plugin = (colors: ColorDefinition[]) => {
    function getColorizer(chart: Chart) {
        return (dataset: ChartDataset, datasetIndex: number) => {
            const controller = chart.getDatasetMeta(datasetIndex).controller;
            const color = colors[datasetIndex % colors.length];

            if (typeof color === 'string') {
                dataset.borderColor = color;
                if (color.startsWith('rgb')) {
                    let intensity  = 0.1;
                    
                    if (controller instanceof DoughnutController) {
                        intensity = 0.5;
                    }
                    dataset.backgroundColor = color.replace('rgb', 'rgba').replace(')', ', ' + intensity + ')');
                }
                return;
            }

            dataset.backgroundColor = color.backgroundColor;
            dataset.borderColor = color.color;
        };
    }

    const plugin: Plugin = {
        id: 'custom-colors',

        defaults: {
            enabled: true,
        } as CustomColorsPluginOptions,


        beforeLayout(chart: Chart, _args, options: CustomColorsPluginOptions) {
            if (!options.enabled) {
                return;
            }

            const {
                data: { datasets },
                options: chartOptions
            } = chart.config;

            const colorizer = getColorizer(chart);

            datasets.forEach(colorizer);
        }
    }

    return plugin;
};

export default customColorPlugin;