import React, {Component} from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

export default class DrawSpace extends Component {
    constructor() {
        super();

        this.state = {
            exportValue: "",

            stringNodes: "",
            stringEdges: ""
        };

        this.drawGraph = this.drawGraph.bind(this);
        this.handleExportGraph = this.handleExportGraph.bind(this);
        this.handleImportGraph = this.handleImportGraph.bind(this);

        this.download = this.download.bind(this);
        this.handleChangeImportArea = this.handleChangeImportArea.bind(this);
        this.handleClearArea = this.handleClearArea.bind(this);

        this.showNodes = this.showNodes.bind(this);
        this.showEdges = this.showEdges.bind(this);
    }

    componentDidMount() {
        const {nodes, edges} = this.props;

        this.drawGraph(nodes, edges);
        this.showEdges(edges);
        this.showNodes(nodes);
        this.setState({exportValue: ""});
        this.props.setNodes([{"id":0,"label":"2","title":0},{"id":1,"label":"3","title":1},{"id":2,"label":"2","title":2},{"id":3,"label":"1","title":3},{"id":4,"label":"1","title":4},{"id":5,"label":"3","title":5},{"id":6,"label":"2","title":6},{"id":7,"label":"3","title":7},{"id":8,"label":"1","title":8}]);

        this.props.setEdges([{"id":0,"label":"2","from":0,"to":4},{"id":1,"label":"1","from":0,"to":6},{"id":2,"label":"3","from":1,"to":4},{"id":3,"label":"2","from":1,"to":7},{"id":4,"label":"2","from":2,"to":7},{"id":5,"label":"4","from":2,"to":5},{"id":6,"label":"1","from":3,"to":5},{"id":7,"label":"2","from":3,"to":8},{"id":8,"label":"1","from":4,"to":6}]);
    }

    componentDidUpdate(prevProps) {
        const {nodes, edges} = this.props;

        if (prevProps.nodes !== nodes || prevProps.edges !== edges) {
            this.drawGraph(nodes, edges);
        }
        if (prevProps.nodes !== nodes) {
            this.showNodes(nodes);
        }
        if (prevProps.edges !== edges) {
            this.showEdges(edges);
        }
    }

    drawGraph(nodes, edges) {
        const self = this;
        const {
            graphType,
            renderMessage,

            renderEditNodeForm,
            handleUpdateNode,
            renderAddEdgeForm,
            handleDeleteNode,

            handleCreateEdge,
            renderEditEdgeForm,
            handleUpdateEdge,
            handleDeleteEdges

        } = self.props;

        const updatedNodes = nodes.map(node => {
            return {...node, label: node.id.toString() + "/" + node.label}
        });

        let nodesOptions = {},
            edgesOptions = {};

        if (graphType === 'system') {
            nodesOptions = {
                shape: "box",
                shapeProperties: {
                    borderRadius: 0
                },
                color: {
                    border: '#784e8c',
                    background: '#d7c6df',
                    highlight: {
                        border: '#402a4b',
                        background: '#f6f2f8'
                    },
                    hover: {
                        border: '#784e8c',
                        background: '#d7c6df'
                    }
                }
            };
            edgesOptions = {
                font: {
                    color: '#343434',
                    size: 14
                }
            };
        } else {
            nodesOptions = {
                shape: "circle",
                color: {
                    border: '#3ecadd',
                    background: '#c0eef4',
                    highlight: {
                        border: '#20a5b7',
                        background: '#ebfafc'
                    },
                    hover: {
                        border: '#3ecadd',
                        background: '#c0eef4'
                    }
                }
            };
            edgesOptions = {
                arrows: {
                    to: {enabled: true, scaleFactor: 1, type: 'arrow'},
                    from: {enabled: false, scaleFactor: 1, type: 'arrow'}
                },
                font: {
                    color: '#343434',
                    size: 14
                }
            };
        }

        const options = {
            locale: 'en',
            autoResize: false,
            height: '100%',
            width: '100%',
            nodes: nodesOptions,
            edges: edgesOptions,
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
                    if (self.props.edges.find(edge => (
                            (edge.from === edgeData.from && edge.to === edgeData.to) ||
                                (edge.from === edgeData.to && edge.to === edgeData.from) ))){
                        renderMessage("Can't connect selected nodes twice");
                        callback(null);

                    } else if (edgeData.from === edgeData.to) {
                        renderMessage("Can't connect the node to itself");
                        callback(null);

                    } else {
                        if (graphType === 'task') {
                            renderAddEdgeForm(edgeData, () => {
                                document.getElementById('add-edge').onclick = () => {
                                    handleCreateEdge(edgeData, callback);
                                }
                            });
                        } else {
                            handleCreateEdge(edgeData, callback);
                        }
                    }
                },

                //Editing Edge
                editEdge: {
                    editWithoutDrag: (edgeData, callback) => {
                        if (graphType === 'task') {
                            renderEditEdgeForm(edgeData, () =>
                              document.getElementById('edit-edge-btn').onclick = () => {
                                  handleUpdateEdge(edgeData, callback);
                              });
                        } else {
                            renderMessage("Can't edit edges in System Graph");
                            callback(null);
                        }
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

        const data = {nodes: updatedNodes, edges: edges};
        const container = document.getElementById('mynetwork');
        const network = new vis.Network(container, data, options);
    }

    //EXPORT / IMPORT
    handleExportGraph() {
        //const exportArea = document.getElementById('import-area');

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
        const {setNodes, setEdges, renderMessage} = this.props;
        const importArea = document.getElementById('import-area');
        const inputValue = importArea.value;

        if (inputValue) {
            const inputData = JSON.parse(inputValue);
            const nodes = inputData[0],
                  edges = inputData[1];

            setNodes(nodes);
            setEdges(edges);
        } else {
            renderMessage("Please, paste the data from the file into the area");
        }
    }

    handleClearArea() {
        this.setState({exportValue: ""});
    }

    showNodes(obj) {
        const stringData = JSON.stringify(obj);
        this.setState({stringNodes: stringData});
    }

    showEdges(obj) {
        const stringData = JSON.stringify(obj);
        this.setState({stringEdges: stringData});
    }

    render() {
        const {testResults} = this.props;
        const {exportValue, stringNodes, stringEdges} = this.state;

        return (
          <div className="workspace-wrapper">
              <div id="mynetwork"></div>

              <div id="test-container">
                  <textarea className="area" value={stringNodes} disabled/>
                  <textarea className="area" value={stringEdges} disabled/>
              </div>
              <textarea className="area" id="test" value={testResults} disabled/>

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
                  <textarea id="import-area" className="area" value={exportValue} onChange={this.handleChangeImportArea}/>
                  <span className="clear" onClick={this.handleClearArea}>Clear Area</span>
              </div>
          </div>
        );
    }
}