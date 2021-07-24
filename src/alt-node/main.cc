#include <node.h>
#include <string>
#include <iostream>

#include "config.h"

void Init(v8::Local<v8::Object> exports)
{
#ifdef DEBUG
    std::cout << "Creating exports" << std::endl;
#endif

    v8::Isolate *isolate = exports->GetIsolate();

    Config::Init(exports);

    auto TypeObject = v8::Object::New(isolate);

    for (int x = 0; x < 5; x++)
    {
        std::string name;

        if (x == 0)
            name = "Boolean";
        else if (x == 2)
            name = "String";
        else if (x == 1)
            name = "Number";
        else if (x == 3)
            name = "List";
        else if (x == 4)
            name = "Dict";

        TypeObject->Set(isolate->GetCurrentContext(), v8::String::NewFromUtf8(isolate, name.c_str()).ToLocalChecked(), v8::Number::New(isolate, x));
    }

    exports->Set(isolate->GetCurrentContext(), v8::String::NewFromUtf8(isolate, "Type").ToLocalChecked(), TypeObject);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Init)