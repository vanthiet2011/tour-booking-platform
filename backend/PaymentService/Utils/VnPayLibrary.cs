using System.Net;
using System.Security.Cryptography;
using System.Text;

public class VnPayLibrary {
    private readonly SortedList<string, string> _requestData = new(new VnPayComparer());
    private readonly SortedList<string, string> _responseData = new(new VnPayComparer());
    private readonly ILogger<VnPayLibrary> _logger;

    public VnPayLibrary(ILogger<VnPayLibrary> logger)
    {
        _logger = logger;
    }

    public void AddRequestData(string key, string value) => _requestData.Add(key, value);
    public void AddResponseData(string key, string value) => _responseData.Add(key, value);

    public string CreateRequestUrl(string baseUrl, string vnp_HashSecret)
    {
        var hashData = new StringBuilder();
        var queryData = new StringBuilder();

        foreach (var kv in _requestData)
        {
            if (!string.IsNullOrEmpty(kv.Value) &&
                !kv.Key.StartsWith("vnp_SecureHash"))
            {
                string encodedValue = WebUtility.UrlEncode(kv.Value);
                hashData.Append($"{kv.Key}={encodedValue}&");
                queryData.Append($"{kv.Key}={encodedValue}&");
            }
        }

        string rawHash = hashData.ToString().TrimEnd('&');
        string queryString = queryData.ToString().TrimEnd('&');
        string vnp_SecureHash = HmacSHA512(vnp_HashSecret, rawHash);

        return $"{baseUrl}?{queryString}&vnp_SecureHash={vnp_SecureHash}";
    }


    public bool ValidateVnPaySignature(
    IDictionary<string, string> inputData,
    string hashSecret)
    {
        var data = inputData
            .Where(x => x.Key != "vnp_SecureHash" && x.Key != "vnp_SecureHashType")
            .OrderBy(x => x.Key)
            .ToDictionary(x => x.Key, x => x.Value);

        var rawData = string.Join("&", data.Select(x =>
            $"{x.Key}={WebUtility.UrlEncode(x.Value)}"));

        var computedHash = HmacSHA512(hashSecret, rawData);

        return computedHash.Equals(
            inputData["vnp_SecureHash"],
            StringComparison.OrdinalIgnoreCase);
    }


    private string HmacSHA512(string key, string inputData) {
        var hash = new StringBuilder();
        byte[] keyBytes = Encoding.UTF8.GetBytes(key);
        byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
        using var hmac = new HMACSHA512(keyBytes);
        byte[] hashValue = hmac.ComputeHash(inputBytes);
        foreach (var theByte in hashValue) hash.Append(theByte.ToString("x2"));
        return hash.ToString();
    }
}

public class VnPayComparer : IComparer<string> {
    public int Compare(string? x, string? y) => string.CompareOrdinal(x, y);
}