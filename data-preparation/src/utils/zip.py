import py7zr

def zip(raw):
    # Example usage
    _dest = '_' + 'raw' if raw else 'processed'
    source_folder = 'data/' + _dest
    output_file = source_folder + '.7z'
    with py7zr.SevenZipFile(output_file, 'w') as archive:
        archive.writeall(source_folder, _dest)

    print(f"Archive created successfully: {output_file}")

if __name__=='__main__':
    zip(True)


