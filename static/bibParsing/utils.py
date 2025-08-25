import re
import json

def read_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None
    except json.JSONDecodeError:
        print(f"Error: The file '{file_path}' is not a valid JSON file.")
        return None

def createMapJSON(citationData, categoriesData):
    MapJSON = {"nodes": [], "edges": []}

    #First include Tag Nodes in the JSON
    if isinstance(categoriesData, dict):
        #for each category
        for key, value in categoriesData.items():
            #color picking per category of difference
            if key == "Representation":
                color = "#fcc737"
            elif key == "Backbone Architecture":
                color = "#FFA09B"
            elif key == "Optimization and Training":
                color = "#e73879"
            elif key == "Benchmarks":
                color = "#D1F8EF"

            #for each tag in the category
            for tag, abbrev in value.items():
                MapJSON["nodes"].append({"id": abbrev, "label": tag, "color": color, "shape": "box", "font":{"size":30}, "group": "tag"})
    else:
        print("Error: Unsupported JSON format.")

    #Then include Citation Nodes in the JSON


    if isinstance(citationData, dict):
        for key, value in citationData.items():
            MapJSON["nodes"].append({"id": key, "label": key, "color": "#FFE6C9", "shape": "ellipse",  "font":{"size":20}, "group": "citation"})

            #create edge for each tag
            tags = value["tags"]
            for tag in tags:
                MapJSON["edges"].append({"from": key, "to": tag, "color": "#1d1616", "arrows": "to"})
               
    return MapJSON





if __name__ == "__main__":
    citFile = "tagged.json"  # Change this to your actual JSON file path
    catFile = "categories.json"
    citData = read_json(citFile)
    catData = read_json(catFile)
    output = "map.json"
    if citData and catData:
        mapJSON = createMapJSON(citData, catData)

    with open(output, "w", encoding="utf-8") as json_file:
        json.dump(mapJSON, json_file, indent=4)