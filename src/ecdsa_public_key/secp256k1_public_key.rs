#[derive(Debug, PartialEq, Eq)]
pub struct Response {
    chain_code: Vec<u8>,
    public_key: Vec<u8>,
}

pub fn derive_pub_key(
    pub_key_without_derivation_path: Response,
    derivation_path: Vec<Vec<u8>>,
) -> Response {
    todo!()
}

#[test]
fn derivation_works() {
    let pub_key_without_derivation_path = Response {
        chain_code: vec![
            33, 40, 145, 188, 3, 47, 40, 211, 105, 186, 207, 57, 220, 54, 159, 235, 81, 110, 206,
            217, 163, 216, 52, 152, 36, 106, 234, 209, 84, 111, 140, 209,
        ],
        public_key: vec![
            2, 184, 79, 243, 248, 131, 41, 168, 135, 101, 125, 3, 9, 189, 26, 26, 249, 227, 118, 1,
            229, 209, 165, 53, 214, 254, 125, 66, 227, 127, 121, 244, 10,
        ],
    };
    let derivation_path: Vec<Vec<u8>> = vec![
        "2".repeat(1).as_bytes().to_vec(),
        "4".repeat(3).as_bytes().to_vec(),
        "6".repeat(5).as_bytes().to_vec(),
    ];
    let pub_key_with_derivation_path = Response {
        chain_code: vec![
            188, 53, 184, 81, 95, 3, 170, 21, 67, 8, 30, 42, 244, 232, 120, 242, 139, 39, 243, 206,
            0, 192, 53, 244, 6, 135, 2, 211, 62, 232, 133, 134,
        ],
        public_key: vec![
            2, 75, 247, 142, 64, 187, 81, 210, 198, 193, 76, 17, 170, 143, 58, 241, 84, 151, 65,
            222, 90, 205, 249, 37, 230, 220, 35, 13, 252, 93, 170, 34, 217,
        ],
    };
    assert_eq!(derive_pub_key(pub_key_without_derivation_path, derivation_path), pub_key_with_derivation_path);
}
