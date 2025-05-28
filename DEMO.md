# Demo

## Chain Fusion Signer Root Key
I have modified the staging chain fusion signer so that it can provide its root key:

Provide an empty derivation path:
```
$ cat args.secp256k1.empty.did
(
  record {
    key_id = record { name = "key_1"; curve = variant { secp256k1 } };
    canister_id = null;
    derivation_path = vec {};
  },
  null,
)
```
And get the canister root key:
```
$ time dfx canister call signer --network staging ecdsa_public_key --argument-file args.secp256k1.empty.did 
(
  variant {
    Ok = record {
      record {
        public_key = blob "\02\b8\4f\f3\f8\83\29\a8\87\65\7d\03\09\bd\1a\1a\f9\e3\76\01\e5\d1\a5\35\d6\fe\7d\42\e3\7f\79\f4\0a";
        chain_code = blob "\21\28\91\bc\03\2f\28\d3\69\ba\cf\39\dc\36\9f\eb\51\6e\ce\d9\a3\d8\34\98\24\6a\ea\d1\54\6f\8c\d1";
      };
    }
  },
)

real	0m5.873s
user	0m0.023s
sys	0m0.016s
```

## Chain Fusion Signer Derived Key
Set a non-empty derived key:

```
$ cat args.secp256k1.123456.did
(
  record {
    key_id = record { name = "key_1"; curve = variant { secp256k1 } };
    canister_id = null;
    derivation_path = vec { blob "2"; blob "444"; blob "66666" };
  },
  null,
)
```
and we can get the derived key:
```
$ time dfx canister call signer --network staging ecdsa_public_key --argument-file args.secp256k1.123456.did 
(
  variant {
    Ok = record {
      record {
        public_key = blob "\02\4b\f7\8e\40\bb\51\d2\c6\c1\4c\11\aa\8f\3a\f1\54\97\41\de\5a\cd\f9\25\e6\dc\23\0d\fc\5d\aa\22\d9";
        chain_code = blob "\bc\35\b8\51\5f\03\aa\15\43\08\1e\2a\f4\e8\78\f2\8b\27\f3\ce\00\c0\35\f4\06\87\02\d3\3e\e8\85\86";
      };
    }
  },
)

real	0m7.201s
user	0m0.019s
sys	0m0.020s
```

## Compute the derived key locally
We need to input the root key and derivation path:
```
$ time npx ts-node src/index.ts secp256k1 '\02\b8\4f\f3\f8\83\29\a8\87\65\7d\03\09\bd\1a\1a\f9\e3\76\01\e5\d1\a5\35\d6\fe\7d\42\e3\7f\79\f4\0a' '\21\28\91\bc\03\2f\28\d3\69\ba\cf\39\dc\36\9f\eb\51\6e\ce\d9\a3\d8\34\98\24\6a\ea\d1\54\6f\8c\d1' 2/444/66666
{
  "request": {
    "key": {
      "public_key": "02b84ff3f88329a887657d0309bd1a1af9e37601e5d1a535d6fe7d42e37f79f40a",
      "chain_code": "212891bc032f28d369bacf39dc369feb516eced9a3d83498246aead1546f8cd1"
    },
    "derivation_path": "2/444/66666"
  },
  "response": {
    "key": {
      "public_key": "024bf78e40bb51d2c6c14c11aa8f3af1549741de5acdf925e6dc230dfc5daa22d9",
      "chain_code": "bc35b8515f03aa1543081e2af4e878f28b27f3ce00c035f4068702d33ee88586"
    }
  }
}

real    0m1.311s
user    0m2.340s
sys     0m0.272s
```
(Note: The time here includes compiling the typescript.)
