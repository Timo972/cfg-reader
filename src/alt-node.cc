#include <node.h>
#include <dlfcn.h>

extern "C" NODE_EXTERN void node_module_register(void* mod) {
  auto base_ptr = dlopen("libnode.so.72", RTLD_NOW | RTLD_GLOBAL);
  if (base_ptr == nullptr) {
    return;
  }
  auto register_func = reinterpret_cast<decltype(&node_module_register)>(dlsym(base_ptr, "node_module_register"));
  if (register_func == nullptr) {
    return;
  }
  register_func(mod);
}
//#include <windows.h>
//
//extern "C" NODE_EXTERN void node_module_register(void *mod)
//{
//
//    auto base_ptr = GetModuleHandle("libnode.dll");
//    if (base_ptr == nullptr)
//    {
//        return;
//    }
//    auto proc = GetProcAddress(base_ptr, "node_module_register");
//
//    if (proc == nullptr)
//    {
//        return;
//    }
//
//    auto register_func = reinterpret_cast<decltype(&node_module_register)>(proc);
//
//    register_func(mod);
//}