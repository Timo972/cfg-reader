#include <napi.h>
#include <string>
#include <iostream>

#include "config.h"

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    #ifdef DEBUG
        std::cout << "Creating exports" << std::endl;
    #endif

    Config::Init(env, exports);

    auto TypeObject = Napi::Object::New(env);

    for (int x = 0; x < 5; x++)
    {
        std::string name;

        if (x == 0)
            name = "Boolean";
        else if(x == 2)
            name = "String";
        else if(x == 1)
            name = "Number";
        else if(x == 3)
            name = "List";
        else if(x == 4)
            name = "Dict";

        TypeObject.Set(name, x);
    }

    exports.Set("Type", TypeObject);

    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)