#include <node.h>
#if defined(WIN32) || defined(_WIN32) || defined(__WIN32) && !defined(__CYGWIN__)
#define ISWIN
#include <windows.h>
typedef void (CALLBACK* NODE_MODULE_REGISTER_FUNC)(void *);
#else
#include <dlfcn.h>
#endif

#ifdef ISWIN
extern "C" NODE_EXTERN void node_module_register(void *mod)
{

    auto base_ptr = GetModuleHandle("libnode.dll");
    if (base_ptr == nullptr)
    {
        return;
    }
    auto register_func = (NODE_MODULE_REGISTER_FUNC)GetProcAddress(base_ptr, "node_module_register");

    if (register_func == nullptr)
    {
        return;
    }

    register_func(mod);

    //auto register_func = reinterpret_cast<decltype(&node_module_register)>(proc);

    //register_func(mod);
}
#else
extern "C" NODE_EXTERN void node_module_register(void *mod)
{
    auto base_ptr = dlopen("libnode.so.72", RTLD_NOW | RTLD_GLOBAL);
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
