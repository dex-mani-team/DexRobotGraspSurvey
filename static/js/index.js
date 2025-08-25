window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;



var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

// Load JSON data and create a simple mindmap
async function loadMindmap() {
  try {
      // Fetch the JSON file
      const response = await fetch('./static/bibParsing/map.json'); // Ensure mindmap.json is in the same directory
      const jsonData = await response.json();

      // Fetch Category JSON for toggling  
      const response2 = await fetch('./static/bibParsing/categories.json'); // Ensure mindmap.json is in the same directory
      const catData = await response2.json();

      // Fetch citation JSON for url clicking and more  
      const response3 = await fetch('./static/bibParsing/tagged.json'); // Ensure mindmap.json is in the same directory
      const citData = await response3.json();

      // Create Vis.js DataSets from the JSON
      const filteredNodes = jsonData.nodes.filter(node => node.group !== 'tag');

      const nodes = new vis.DataSet(jsonData.nodes);
      const edges = new vis.DataSet(jsonData.edges);

      //util funcs
      function removeOrphanNodes() {
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            const connectedEdges = edges.get({
                filter: edge => edge.from === node.id || edge.to === node.id
            });
            if (connectedEdges.length === 0) {
                nodes.remove(node.id);
            }
        });
      }

      function removeTagNodes() {
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            if (node.group === 'tag') {
                const connectedEdges = edges.get({
                    filter: edge => edge.from === node.id || edge.to === node.id
                });
                edges.remove(connectedEdges);
                nodes.remove(node.id);
            }
        });
    }

       // Function to toggle nodes
      function toggleNode(nodeId, nodeData, connectedEdges, isChecked) {
        if (!isChecked) {
            // Remove node and its edges
            nodes.remove(nodeId);
            edges.remove(connectedEdges);
        } else {
            // Add node and edges
            nodes.add(nodeData);
            edges.add(connectedEdges);
        }
        adjustNodeSizes();
      }

      // Function to handle checkbox toggling
      function handleCheckboxToggle() {
        document.querySelectorAll('#toggleTags input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                const category = this.name;
                for (let tag in catData[category]) {
                    tagNodeID = catData[category][tag];
                    const nodeData = jsonData.nodes.find(node => node.id === tagNodeID);
                    const connectedEdges = jsonData.edges.filter(edge => edge.to === tagNodeID);
                    toggleNode(tagNodeID, nodeData, connectedEdges, this.checked);
                }
            });
        });
      }

      function adjustNodeSizes() {
        const allNodes = nodes.get();
        allNodes.forEach(node => {
            const incomingEdges = edges.get({ filter: edge => edge.to === node.id });
            const newSize = Math.min(20 + incomingEdges.length * 2, 50); // Base size 10, scale with edges
            nodes.update({ id: node.id, color:node.color, font: { size: newSize } });
        });
      }

      // Function to display node information
      function displayNodeInfo(node) {
        const infoContainer = document.getElementById("clickedNodeInfo");
        infoContainer.innerHTML = "";
        if (node) {
            const title = document.createElement("h3");
            title.textContent = node.label;
            infoContainer.appendChild(title);

          nodeAuthor = citData[node.id]['author'];
          nodeYear = citData[node.id]['year'];

          if (nodeAuthor) {
              const author = document.createElement("p");
              author.textContent = `Author: ${nodeAuthor}`;
              infoContainer.appendChild(author);
          }
          
          if (nodeYear) {
              const year = document.createElement("p");
              year.textContent = `Year: ${nodeYear}`;
              infoContainer.appendChild(year);
          }

            nodeUrl = citData[node.id]['url'];
            if (nodeUrl) {
                const link = document.createElement("a");
                link.href = nodeUrl;
                link.target = "_blank";
                link.textContent = "Open Citation";
                infoContainer.appendChild(link);
            }
            
            
        }
    }

      

       // Create a container for the buttons
       const containerWrapper = document.createElement("div");
       containerWrapper.id = "containerWrapper";
       document.body.insertBefore(containerWrapper, document.body.firstChild);



      // Get the container for the network
      const container = document.getElementById('mindmap');
      const data = { nodes, edges };
      const options = {
        physics: {
          enabled: true,
          barnesHut: {
              // gravitationalConstant: -3000,
              centralGravity: 0.4,
              // springLength: 200,
              // springConstant: 0.05,
              // damping: 0.09,
              avoidOverlap: 0.3
          }
      },
      edges: { arrows: "to", length: 200 },
      };

      removeOrphanNodes();
       // Initialize checkbox listeners
      handleCheckboxToggle();
      //adjustNodeSizes();

      // Create the Vis.js network
      const network = new vis.Network(container, data, options);

      removeTagNodes();
      adjustNodeSizes();

      network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            displayNodeInfo(node);
        }
      });

  } catch (error) {
      console.error("Error loading mindmap JSON:", error);
  }
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

});

// Call the function on page load
document.addEventListener("DOMContentLoaded", loadMindmap);


// document.addEventListener("DOMContentLoaded", function () {
//   // Define nodes
//   var nodes = new vis.DataSet([
//       { id: 1, label: "Node 1" },
//       { id: 2, label: "Node 2" },
//       { id: 3, label: "Node 3" },
//       { id: 4, label: "Node 4" },
//       { id: 5, label: "Node 5" }
//   ]);

//   // Define edges (connections between nodes)
//   var edges = new vis.DataSet([
//       { from: 1, to: 2 },
//       { from: 1, to: 3 },
//       { from: 2, to: 4 },
//       { from: 2, to: 5 }
//   ]);

//   // Create a network graph
//   var container = document.getElementById("mindmap");
//   var data = { nodes: nodes, edges: edges };
//   var options = {
//       physics: { enabled: true }, // Makes nodes move dynamically
//   };

//   var network = new vis.Network(container, data, options);
// });