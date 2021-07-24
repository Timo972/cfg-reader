#include <node.h>
#ifdef __unix__
#define ISLINUX
#include <dlfcn.h>
#endif

#ifdef __unix__
extern "C" NODE_EXTERN void node_module_register(void *mod)
{
    auto base_ptr = dlopen("libnode.so.83", RTLD_NOW | RTLD_GLOBAL);
    if (base_ptr == nullptr)
    {
        return;
    }
    auto register_func = reinterpret_cast<decltype(&node_module_register)>(dlsym(base_ptr, "node_module_register"));
    if (register_func == nullptr)
    {
        return;
    }
    register_func(mod);
}
#endif