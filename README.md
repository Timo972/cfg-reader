# cfg-reader -- alt-config port in python
Python package for reading alt-config format config files.
Used by alt:V Multiplayer.  
Maybe you want to use this package along the [alt:V Python module](https://github.com/Marvisak/altv-python-module).

## Usage
```js
// server.cfg
name: Test
port: 7788
announce: true
token: 'my token with special chars'
modules: [
    go-module
]
resources: [
    test
]
voice: {
    port: 7789
    ip: 127.0.0.1
    external: true
}
```

```py
# main.py
import cfg_reader

def main():
	cfg = cfg_reader.Config("server.cfg")
	port = cfg.get("port")
	print(port)
	voice = cfg.get("voice")
	print(voice["port"])

	cfg.set("test", "Hello World")

	# saves changes to the file you opened
	err = cfg.save(False, False)
	
	# serializes into string
	content = cfg.serialize(False, False)
	print(content)
```