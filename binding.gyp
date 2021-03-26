{
  "targets": [
    {
      "cflags_cc": ["-std=c++17"],
      "target_name": "json",
      "sources": ["src/main.cc","src/config.cc","src/convert.cc","src/helper.cc"],
      "include_dirs": ["deps/alt-config","include"],
      "defines": []
    }
  ]
}