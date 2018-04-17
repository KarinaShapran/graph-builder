import React, {Component} from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

export default class DrawSpace extends Component {
    constructor() {
        super();

        this.state = {
            exportValue: ""
        };

        this.drawGraph = this.drawGraph.bind(this);
        this.handleExportGraph = this.handleExportGraph.bind(this);
        this.handleImportGraph = this.handleImportGraph.bind(this);

        this.download = this.download.bind(this);
        this.handleChangeImportArea = this.handleChangeImportArea.bind(this);
        this.handleClearArea = this.handleClearArea.bind(this);
    }

    componentDidMount() {
        this.drawGraph(this.props.nodes, this.props.edges);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.nodes !== this.props.nodes || prevProps.edges !== this.props.edges) {
            this.drawGraph(this.props.nodes, this.props.edges);
        }
    }

    drawGraph(nodes, edges) {
        const self = this;
        const {
            renderMessage,

            renderEditNodeForm,
            handleUpdateNode,
            renderAddEdgeForm,
            handleDeleteNode,

            handleCreateEdge,
            renderEditEdgeForm,
            handleUpdateEdge,
            handleDeleteEdges,

        } = self.props;

        const options = {
            locale: 'en',
            autoResize: false,
            height: '100%',
            width: '100%',
            nodes: {
                shape: 'ellipse'
            },
            edges: {
                arrows: {
                    to: {enabled: true, scaleFactor: 1, type: 'arrow'},
                    from: {enabled: false, scaleFactor: 1, type: 'arrow'}
                },
                font: {
                    color: '#343434',
                    size: 14
                }
            },
            manipulation: {
                addNode: false,

                // Editing Node
                editNode: (data, callback) => {
                    renderEditNodeForm(data, () =>
                      document.getElementById('update-node-btn').onclick = () => {
                          handleUpdateNode(data, callback);
                      }
                    );
                },

                //Adding Edge
                addEdge: (edgeData, callback) => {
                    if (this.props.edges.find(edge => (
                            (edge.from === edgeData.from && edge.to === edgeData.to) ||
                                (edge.from === edgeData.to && edge.to === edgeData.from) ))){
                        renderMessage("Can't connect selected nodes twice");
                        callback(null);

                    } else if (edgeData.from === edgeData.to) {
                        renderMessage("Can't connect the node to itself");
                        callback(null);

                    } else {
                        renderAddEdgeForm(edgeData, () => {
                            document.getElementById('add-edge').onclick = () => {
                                handleCreateEdge(edgeData, callback);
                            }
                        });
                    }
                },

                //Editing Edge
                editEdge: {
                    editWithoutDrag: (edgeData, callback) => {
                        renderEditEdgeForm(edgeData, () =>
                          document.getElementById('edit-edge-btn').onclick = () => {
                              handleUpdateEdge(edgeData, callback);
                          }
                        );
                    }
                },

                //Deleting Node
                deleteNode: (data, callback) => {
                    if (data.edges.length !== 0) {
                        handleDeleteEdges(data.edges);
                    }
                    handleDeleteNode(data.nodes);
                    callback(data);
                },

                //Deleting Edge
                deleteEdge: (data, callback) => {
                    handleDeleteEdges(data.edges);
                    callback(data);
                }
            },
        };

        const data = {nodes: nodes, edges: edges};
        const container = document.getElementById('mynetwork');
        const network = new vis.Network(container, data, options);
        //this.props.updateNodes(network.body.data.nodes._data);
    }

    //EXPORT / IMPORT
    handleExportGraph() {
        const exportArea = document.getElementById('import-area');

        const data = [
          this.props.nodes,
          this.props.edges
        ];

        const exportValue = JSON.stringify(data, undefined, 2);

        this.setState({exportValue: exportValue});

        this.download(exportValue, 'json.txt', 'text/plain');
    }

    download(content, fileName, contentType) {
        const a = document.createElement("a");
        const file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    handleChangeImportArea(e) {
        this.setState({exportValue: e.target.value});
    }

    handleImportGraph() {
        const exportArea = document.getElementById('import-area');

        const inputValue = exportArea.value;

        if (inputValue) {
            const inputData = JSON.parse(inputValue);

            const nodes = inputData[0],
              edges = inputData[1];

            this.props.setNodes(nodes);
            this.props.setEdges(edges);
        } else {
            this.props.renderMessage("Please, paste the data from the file into the area");
        }
    }

    handleClearArea() {
        this.setState({exportValue: ""});
    }

    render() {
        const {exportValue} = this.state;

        return (
          <div className="workspace-wrapper">
              <div id="mynetwork"></div>
              <div className="form-control export-form">
                  <button
                    id="export-btn"
                    className="btn grey"
                    type="submit"
                    onClick={this.handleExportGraph}
                  >
                      Export
                  </button>
                  <button
                    id="import-btn"
                    className="btn purple"
                    type="submit"
                    onClick={this.handleImportGraph}
                  >
                      Import
                  </button>
                  <span className="info">Paste the data from the exported file into the area below.</span>
                  <textarea id="import-area" value={exportValue} onChange={this.handleChangeImportArea}/>
                  <span className="clear" onClick={this.handleClearArea}>Clear Area</span>
              </div>
          </div>
        );
    }
}