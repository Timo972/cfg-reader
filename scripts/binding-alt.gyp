{
    "targets": [
        {
            "cflags": ["-fexceptions"],
            "cflags_cc": ["-fexceptions"],
            "target_name": "config_alt",
            "sources": ["src/alt-node/main.cc", "src/alt-node/config.cc", "src/alt-node/helper.cc", "src/alt-node/alt-node.cc"],
            "include_dirs": ["deps/alt-config", "include/alt-node"],
            'defines': [],
            "conditions": [
                ['OS=="mac"', {
                    "xcode_settings": {
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                        "CLANG_CXX_LIBRARY": "libc++",
                        "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
                        'MACOSX_DEPLOYMENT_TARGET': '10.14'
                    }
                }],
                ['OS=="win"', {
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                            "AdditionalOptions": ["-std:c++17", "-EHsc"],
                        },
                    },
                }],
                ['OS=="linux"', {
                    'cflags_cc': [
                        "-std=c++17"
                    ]
                }]
            ]
        }
    ]
}
