{
    "targets": [
        {
            "cflags": [ "-fno-exceptions", "-std=c++17"],
            "cflags_cc": ["-fno-exceptions","-std=c++17"],
            "target_name": "config",
            "sources": ["src/main.cc","src/convert.cc"],
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
                }]
            ]
        }
    ]
}