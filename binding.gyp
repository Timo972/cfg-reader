{
    "targets": [
        {
            "cflags": ["-fexceptions"],
            "cflags_cc": ["-fexceptions"],
            "target_name": "config",
            "sources": ["src/napi/main.cc", "src/napi/config.cc", "src/napi/helper.cc"],
            "include_dirs": ["<!(node -p \"require('node-addon-api').include_dir\")", "deps/alt-config", "include/napi"],
            'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
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
        },
        {
            "cflags": ["-fexceptions"],
            "cflags_cc": ["-fexceptions"],
            "target_name": "config_alt",
            "sources": ["src/v8/main.cc", "src/v8/config.cc", "src/v8/helper.cc", "src/v8/alt-node.cc"],
            "include_dirs": ["deps/alt-config", "include/v8"],
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
