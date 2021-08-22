from .node import *
from .detail import *


class Emitter:
    def __init__(self) -> object:
        self.stream = ""

    def emit(self, node: Node, indent: int, is_last: bool = True, use_commas: bool = False, use_apostrophes: bool = False):
        _indent = ' ' * (indent * 2)

        if node.is_scalar():
            string: str = node.to_string()
            special_chars = string.count(" ")
            if use_apostrophes or special_chars > 0:
                self.stream += "'" + escape(string) + "'\n"
            else:
                self.stream += escape(string) + "\n"

        elif node.is_list():
            self.stream += "[\n"

            _list = node.to_list()
            i = 0
            end = len(_list) - 1
            for node in _list:
                self.stream += _indent
                self.emit(node, indent + 1, i == end, use_commas, use_apostrophes)
                i += 1

            self.stream += " " * ((indent - 1) * 2)

            if is_last or not use_commas:
                self.stream += "]\n"
            else:
                self.stream += "],\n"
        elif node.is_dict():
            if indent > 0:
                self.stream += "{\n"

            _dict = node.to_dict()
            i = 0
            end_idx = len(_dict) - 1

            for key, node in _dict:
                if node is None or node.is_none():
                    continue
                self.stream += _indent + key + ":"
                self.emit(node, indent + 1, i == end_idx, use_commas, use_apostrophes)
                i += 1

            if indent > 0:
                self.stream += " " * ((indent - 1) * 2)
                if is_last or not use_commas:
                    self.stream += "}\n"
                else:
                    self.stream += "},\n"
        return None

    def get_string(self):
        return self.stream