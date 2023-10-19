using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

namespace nucleus_remote_client.Lib
{
    internal class ClientHelper
    {
        internal static HttpClient GetHttpClient(HostSettings hostSettings)
        {
            HttpClient client = new()
            {
                BaseAddress = new Uri(hostSettings.BaseUrl ?? ""),
            };

            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", GetAuthToken(hostSettings));

            return client;
        }

        private static string GetAuthToken(HostSettings hostSettings)
        {
            using var rsa = RSA.Create();
            rsa.ImportFromPem(hostSettings.PrivateKey);

            var signingCredentials = new SigningCredentials(new RsaSecurityKey(rsa), SecurityAlgorithms.RsaSha256)
            {
                CryptoProviderFactory = new CryptoProviderFactory { CacheSignatureProviders = false }
            };

            var now = DateTime.Now;

            var jwt = new JwtSecurityToken(
              audience: "all",
              claims: new[] {
                  new Claim("clientId", hostSettings.Id??""),
                  new Claim("tenantId", hostSettings.TenantId??""),
                  new Claim("keyId", hostSettings.KeyId??""),
                  new Claim("iat", now.ToBinary().ToString()),
              },
              expires: now.AddMinutes(5),
              signingCredentials: signingCredentials
            );

            return new JwtSecurityTokenHandler().WriteToken(jwt);

        }
    }
}
