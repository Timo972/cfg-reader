from parse import *


def read_file(file_name: str):
    file = open(file_name)
    content = file.read()
    file.close()
    parser = Parser(content)
    return parser.parse()


def write_file(file_name: str, content: str):
    file = open(file_name)
    file.write(content)
    file.close()
    return
