# Test vectors

There is a custom version of the chain fusion signer deployed to help with this; it passes through derivation paths without adding the caller.

## Secp256k1 test vectors

The basic canister call is:

```
dfx canister call signer --network staging ecdsa_public_key --argument-file args.XXX.did
```

### `secp256k1.empty`

```
cat <<EOF >args.secp256k1.empty.did
(
  record {
    key_id = record { name = "key_1"; curve = variant { secp256k1 } };
    canister_id = null;
    derivation_path = vec {};
  },
  null,
)
EOF
```

Answer:

```
$ dfx canister call signer --network staging ecdsa_public_key --argument-file args.secp256k1.empty.did
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
```

### `secp256k1.123456`

```
cat <<EOF >args.secp256k1.123456.did
(
  record {
    key_id = record { name = "key_1"; curve = variant { secp256k1 } };
    canister_id = null;
    derivation_path = vec { blob "2"; blob "444"; blob "66666" };
  },
  null,
)
EOF
```

Answer:

```
$ dfx canister call signer --network staging ecdsa_public_key --argument-file args.secp256k1.123456.did
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
```
