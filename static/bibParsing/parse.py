import re
import json
import argparse

def parse_bibtex(file_path):
    """Parses a .bib file and extracts citation data along with associated tags."""
    with open(file_path, "r", encoding="utf-8") as file:
        bib_content = file.readlines()
    
    parsed_entries = {}
    current_key = None
    entry_tags = {}  # Dictionary to store tags for each citation
    
    for line in bib_content:
        line = line.strip()
        
        if line.startswith("@"):  # New entry
            entry_type_match = re.match(r'@(\w+){([^,]+),', line)
            if entry_type_match:
                entry_type, citation_key = entry_type_match.groups()
                current_key = citation_key
                parsed_entries[citation_key] = {"type": entry_type, "fields": {}, "tags": []}
                if citation_key in entry_tags:
                    parsed_entries[citation_key]["tags"] = entry_tags[citation_key]  # Assign any previously stored tags
        
        elif current_key and "=" in line:  # Entry fields
            field_match = re.match(r'(\w+)\s*=\s*[{"](.+?)[}"],?', line)
            if field_match:
                field, value = field_match.groups()
                parsed_entries[current_key]["fields"][field] = value
        
        elif line.startswith("}"):  # Extract tags
            line = line[1:]
            tags = [tag.strip() for tag in line.split(",") if tag.strip().startswith("#")]
            clean_tags = [tag[1:] for tag in tags]  # Remove '#' prefix
            if current_key:
                parsed_entries[current_key]["tags"].extend(clean_tags)
            else:
                for key in parsed_entries:
                    parsed_entries[key]["tags"].extend(clean_tags)
    
    # Convert parsed data into structured JSON
    bib_json = {
        key: {
            "type": entry["type"],
            "title": entry["fields"].get("title", "Unknown Title"),
            "author": entry["fields"].get("author", "Unknown Author"),
            "year": entry["fields"].get("year", "Unknown Year"),
            "journal": entry["fields"].get("journal", entry["fields"].get("booktitle", "Unknown Source")),
            "doi": entry["fields"].get("doi", ""),
            "url": entry["fields"].get("url", ""),
            "tags": list(set(entry.get("tags", [])))  # Ensure unique tags
        }
        for key, entry in parsed_entries.items()
    }
    
    return bib_json


def main():
    # parser = argparse.ArgumentParser(description="Convert a .bib file to JSON with citation tags.")
    # parser.add_argument("bibfile", help="Path to the .bib file")
    # parser.add_argument("output", help="Path to the output JSON file")
    # args = parser.parse_args()
    bibfile = '../references/references.bib' 
    output = 'tagged.json'
    
    bib_data = parse_bibtex(bibfile)
    
    with open(output, "w", encoding="utf-8") as json_file:
        json.dump(bib_data, json_file, indent=4)
    
    print(f"JSON file saved at {output}")

if __name__ == "__main__":
    main()
