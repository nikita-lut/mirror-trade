const { sign } = require("jsonwebtoken");
const crypto = require("crypto");

const key_name =
  "organizations/b1c0220a-eeee-4e3e-bf98-006f52392b5f/apiKeys/b0e4e073-90e9-42ae-9355-7560b5d2edd9";
const key_secret =
  "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIDtgdZqypAMWhEF3JwxNJEHfa4J1TxaTjRnITuMrAnuXoAoGCCqGSM49\nAwEHoUQDQgAEhAPrpVlcpj/PDBCNx72nnZImgPcEHJ+eLc1p+EOYC/BzjtozmuLU\neEMfh2ZFLC8tM7ea6kl4n0cEGhSJ3TiYrg==\n-----END EC PRIVATE KEY-----\n";
const request_method = "GET";
const url = "api.coinbase.com";
const request_path = "/api/v3/brokerage/accounts";

const algorithm = "ES256";
const uri = request_method + " " + url + request_path;

const token = sign(
  {
    iss: "coinbase-cloud",
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120,
    sub: key_name,
    uri,
  },
  key_secret,
  {
    algorithm,
    header: {
      kid: key_name,
      nonce: crypto.randomBytes(16).toString("hex"),
    },
  }
);

module.exports = token;
console.log("export JWT=" + token);
