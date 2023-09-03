# Nucleus Remote Server

Nucleus Remote Server dient zur Verwaltung von Computern über das Internet.

- [Nucleus Remote Server](#nucleus-remote-server)
  - [Clients](#clients)
  - [Aufgaben](#aufgaben)
    - [Link Erstellen](#link-erstellen)
    - [Datei Löschen](#datei-löschen)
    - [Datei Herunterladen](#datei-herunterladen)
    - [Datei Ausführen](#datei-ausführen)
  - [Verzeichnisse](#verzeichnisse)
  - [Konfigurationen](#konfigurationen)
  - [Gruppen](#gruppen)
  - [Mandanten](#mandanten)


## Clients

Computer, die den nucleus-remote-client ausführen, melden sich am Server an und bekommen vom Server Aufgaben, welche diese Computer dann ausführen können.

Die Aufgaben werden Periodisch (alle 60 Sekunden) vom Server abgerufen und sind somit immer aktuell.

## Aufgaben

Auf dem Server können Aufgaben definiert werden, welche dann von den Clients ausgeführt werden können. Aufgaben werden über die [Konfigurationen](#konfigurationen) erstellt.

Jede Aufgabe verfügt über verschiedene Eigenschaften, die bestimmen, wie diese Aufgabe ausgeführt wird.

- `Typ` - Der Typ bestimmt die Art der Aufgabe.
- `Aktiv` - Gibt an, ob die Aufgabe aktiv ist. Nicht aktive Aufgaben werden nicht vom Client ausgeführt, auch wenn diese zu einer Konfiguration gehören, die dem Client zugeordnet ist.
- `Nur einmal ausführen` - Diese Aufgabe wird nur das erste mal wo der Client diese Aufgabe herunterlädt ausgeführt.

Abseits dieser Eigenschaften haben die unterschiedlichen Typen von Aufgaben spezielle Eigenschaften die Konfiguriert werden müssen.

### Link Erstellen
- `Verzeichnis` [<sup>1</sup>](#verzeichnisse) - Das Verzeichnis in dem die Verknüpfung erstellt werden soll.
- `Verknüpfungsname` - Der Name der Verknüpfung.
- `Zielpfad` [<sup>1</sup>](#verzeichnisse) - Die Anwendung die ausgeführt werden soll, wenn auf den Link geklickt wird.
- `Argumente` - Argumente, die der Anwendung mitgegeben werden soll.
- `Arbeitsverzeichnis` [<sup>1</sup>](#verzeichnisse) - Das Arbeitsverzeichnis der Anwendung.
- `Symbolpfad` - Der Pfad für das Symbol der Verknüpfung. Über den Button `Symbol wählen` kann aus einigen Standardsymbolen ausgewählt werden.
- `Existierende überschreiben` - Gibt an, ob der Link gelöscht werden soll, bevor er wieder erstellt wird. Das kann sinnvoll sein, wenn Benutzeranpassungen überschrieben werden sollen.

### Datei Löschen
- `Pfad` [<sup>1</sup>](#verzeichnisse) - Der Pfad der zu löschenden Datei oder des zu löschenden Verzeichnisses 
- `Rekursiv` - Wenn der Pfad ein Verzeichnis ist, werden Unterordner und Dateien im Verzeichnis auch gelöscht. Ist die Option deaktiviert, wird der Ordner nicht gelöscht.
- `Ignorieren, wenn nicht vorhanden` - Wenn diese Option aktiviert ist, wird keine Fehlermeldung zum Server geschickt, sollte die Datei nicht vorhanden sein.

### Datei Herunterladen
- `Remote Url` - Die URL von der die Datei heruntergeladen werden soll
- `Ziel` [<sup>1</sup>](#verzeichnisse) - Der Dateipfad unter dem die Datei gespeichert werden soll
- `Überschreiben` - Wenn diese Option aktiviert ist, werden vorhandene Dateien überschrieben.
- `Ignorieren, wenn vorhanden` - Wenn am Zielpfad bereits eine Datei ist, wird keine Datei heruntergeladen.

### Datei Ausführen
- `Datei` [<sup>1</sup>](#verzeichnisse) - Die Anwendung die ausgeführt werden soll.
- `Argumente` - Argumente, die der Anwendung mitgegeben werden soll.
- `Fenster verstecken` - Gibt an ob ein Fenster geöffnet wird, wenn diese Anwendung gestartet wird.
- `Starten, wenn bereits gestartet` - Wenn diese Option deaktiviert ist, wird vor dem Ausführen überprüft, ob ein Prozess mit gleichen Namen bereits gestartet ist. Ist dies nicht der fall wird die Anwendung gestartet. Andernfalls wird die Anwendung nicht erneut gestartet.

## Verzeichnisse

Verzeichnisse werden Serverseitig aufbereitet. Folgende Platzhalter können verwendet werden um den Pfad dynamisch zu erstellen:

- `{{username}}` - Der Benutzername des angemeldeten Benutzers
- `{{cwd}}` - Das aktuelle Arbeitsverzeichnis des Clients

Des weiteren gibt es einige Standardpfade, die ersetzt werden können. Dazu muss dieser Standardpfad an erster Stelle im Textfeld des Pfades sein.

Bspw. `Desktop/Taschenrechner.lnk`.

Dabei wird der **erste** Teil (`Desktop`) durch den Benutzerdesktop des angemeldeten Benutzer ersetzt.

Folgende Pfade können verwendet werden:
- `Desktop` - C:/Users/\<Benutzername\>/Desktop
- `Eigene Dokumente` - C:/Users/\<Benutzername\>/Documents
- `Eigene Musik` - C:/Users/\<Benutzername\>/Music
- `Eigene Bilder` - C:/Users/\<Benutzername\>/Pictures
- `Eigene Videos` - C:/Users/\<Benutzername\>/Videos
- `Startmenü` - C:/Users/\<Benutzername\>/AppData/Roaming/Microsoft/Windows/Start Menu/Programs
- `Autostart` - C:/Users/\<Benutzername\>/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup

## Konfigurationen

Konfigurationen sind Gruppierungen von Aufgaben. Sie stellen ein Bindegleid zwischen den Gruppen und den Aufgaben dar.

## Gruppen

Clients und Konfigurationen werden Gruppen zugeordnet. Dies kann manuell erfolgen, oder wenn der Haken `Standardgruppe` aktiv ist, werden neue Clients automatisch dieser Gruppe zugeordnet.

Beim Abruf der Aufgaben werden alle *aktiven Aufgaben* aus allen *Konfigurationen* der *Gruppen* die dem Client zugeordnet sind heruntergeladen und ausgeführt.

## Mandanten

Jedem Mandanten sind eine bestimmte Anzahl an gleichzeitig agierenden Clients zugeordnet. Die Anzahl der gleichzeitigen Clients kann über der Auflistung aller Clients eingesehen werden.

Clients, welche darüber hinaus sich anmelden werden als `nicht aktiv` angezeigt, und können damit auch keine Aufgaben ausführen.