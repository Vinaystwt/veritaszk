// The 'test_veritaszk' test program.
import veritaszk.aleo;
program test_veritaszk.aleo {
    @test
    @should_fail
    fn do_nothing() {
        let result: u32 = veritaszk.aleo::main(2u32, 3u32);
        assert_eq(result, 3u32);
    }

    @noupgrade
    constructor() {}
}

@test
script test_it() {
    let result: u32 = veritaszk.aleo::main(1u32, 2u32);
    assert_eq(result, 3u32);
}
