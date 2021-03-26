{
    "targets": [
        {
            "cflags": [ "-fno-exceptions" ],
            "cflags_cc": [ "-fno-exceptions" ],
            "target_name": "config",
            "sources": ["src/main.cc","src/convert.cc","src/config.cc","src/helper.cc"],
            "include_dirs": ["<!(node -p \"require('node-addon-api').include_dir\")", "deps/alt-config", "include"],
            'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
            "conditions": [
                ['OS=="mac"', {
                    "xcode_settings": {
                        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                        "CLANG_CXX_LIBRARY": "libc++",
                        "CLANG_CXX_LANGUAGE_STANDARD":"c++17",
                        'MACOSX_DEPLOYMENT_TARGET': '10.14'
                    }
                }],
                ['OS=="win"', {
                    "msvs_settings": {
                        "VCCLCompilerTool": {
                        "AdditionalOptions": [ "-std:c++17"],
                        },
                    },
                }],
                ['OS=="linux"', {
                    'cflags_cc': [
                        '-fexceptions',
                        '-std=c++17',
                        '-Wno-ignored-qualifiers',
                        '-Wno-return-type',
                        '-Wno-switch',
                        '-Wno-sign-compare',
                        '-Wno-missing-field-initializers'
                    ]
                }]
            ]
        }
    ]
}