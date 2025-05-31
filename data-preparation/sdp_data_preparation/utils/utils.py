import os


def get_project_root_path() -> str:
    """Returns the path of the project root"""
    dir_path = os.path.dirname(os.path.realpath(__file__))
    dir_name = os.path.basename(dir_path)

    # We go up in the directory level until
    # we are at the root of the project
    while dir_name != "shiftdataportal":
        dir_path = os.path.dirname(dir_path)
        dir_name = os.path.basename(dir_path)

    return dir_path
