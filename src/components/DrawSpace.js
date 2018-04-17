import React, {Component} from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';

export default class DrawSpace extends Component {
    constructor() {
        super();

        this.state = {
            //Edge label
            label: "",
            //Edge ID
            id: 0,
            edges: [],
            idEdit: null,

            edgeForUpdate: {
                id: "",
                from: "",
                to: "",
                label: ""
            },

            isActiveAddEdgeForm: false,
            isActiveEditEdgeForm: false,

            exportValue: ""
        };

        this.drawGraph = this.drawGraph.bind(this);

        this.renderAddEdgeForm = this.renderAddEdgeForm.bind(this);
        this.renderEditEdgeForm = this.renderEditEdgeForm.bind(this);

        this.onCloseAddEdgeForm = this.onCloseAddEdgeForm.bind(this);
        this.onCloseEditEdgeForm = this.onCloseEditEdgeForm.bind(this);

        this.handleCreateEdge = this.handleCreateEdge.bind(this);
        this.handleExportGraph = this.handleExportGraph.bind(this);
        this.handleImportGraph = this.handleImportGraph.bind(this);

        this.updateEdge = this.updateEdge.bind(this);
        this.deleteEdge = this.deleteEdge.bind(this);
        this.deleteEdges = this.deleteEdges.bind(this);

        this.download = this.download.bind(this);
        this.handleChangeImportArea = this.handleChangeImportArea.bind(this);
        this.handleClearArea = this.handleClearArea.bind(this);
    }

    componentDidMount() {
        this.drawGraph(this.props.nodes, this.state.edges);
    }

    componentDidUpdate(prevProps) {
        //TODO add for update edges
        if (prevProps.nodes !== this.props.nodes) {
            this.drawGraph(this.props.nodes, this.state.edges);
        }
    }

    drawGraph(nodes, edges) {
        const self = this;

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
                    self.props.renderEditNodeForm(data, () =>
                      document.getElementById('update-node-btn').onclick = () => {
                          self.props.saveEditedNodeData(data, callback);
                          self.props.updateNode(data);
                      }
                    );
                },

                //Adding Edge
                addEdge: (edgeData, callback) => {
                    if (this.state.edges.find(edge => (
                            (edge.from === edgeData.from && edge.to === edgeData.to) ||
                                (edge.from === edgeData.to && edge.to === edgeData.from) ))){
                        self.props.renderMessage("Can't connect selected nodes twice");
                        callback(null);
                    } else if (edgeData.from === edgeData.to) {
                        self.props.renderMessage("Can't connect the node to itself");
                        callback(null);
                    } else {
                        self.renderAddEdgeForm(edgeData, () => {
                            document.getElementById('add-edge').onclick = () => {
                                self.handleCreateEdge(edgeData, self.onCloseAddEdgeForm, callback);
                            }

                        });
                    }
                },

                //Editing Edge
                editEdge: {
                    editWithoutDrag: (edgeData, callback) => {
                        self.renderEditEdgeForm(edgeData, () =>
                          document.getElementById('edit-edge-btn').onclick = () => {
                              self.handleUpdateEdge(edgeData, callback);
                              self.updateEdge(edgeData, self.onCloseEditEdgeForm);
                          }
                        );
                    }
                },

                //Deleting Node
                deleteNode: (data, callback) => {
                    if (data.edges.length !== 0) {
                        self.deleteEdges(data.edges);
                    }
                    self.props.deleteNode(data.nodes);
                    callback(data);
                },

                //Deleting Edge
                deleteEdge: (data, callback) => {
                    self.deleteEdge(data.edges);
                    callback(data);
                }
            },
        };

        const data = {nodes: nodes, edges: edges};
        const container = document.getElementById('mynetwork');
        const network = new vis.Network(container, data, options);
        //this.props.updateNodes(network.body.data.nodes._data);
    }

    //ADD EDGE METHODS
    renderAddEdgeForm(edge, callback) {
        this.setState({
            isActiveAddEdgeForm: !this.state.isActiveAddEdgeForm
        }, () => callback());
    }

    handleChangeEdgeWeight(e) {
        this.setState({
            label: e.target.value
        });
    }

    handleCreateEdge(data, callback, defaultCallback) {
        data.label = this.state.label;
        data.id = this.state.id;

        this.setState({
            edges: [...this.state.edges, {
                id: data.id,
                label: this.state.label,
                from: data.from,
                to: data.to
            }],
            id: this.state.id + 1
        }, () => {
            callback();
            defaultCallback(data);
        });
    }

    onCloseAddEdgeForm() {
        this.setState({
            isActiveAddEdgeForm: !this.state.isActiveAddEdgeForm,
            label: null
        });
        this.inputEdgeWeight.value = "";
    }

    //EDIT EDGE METHODS
    renderEditEdgeForm(edgeData, callback) {
        this.setState({
            isActiveEditEdgeForm: !this.state.isActiveEditEdgeForm,
            idEdit: edgeData.id
        }, () => callback());
    }

    handleUpdateEdge(edgeData, callback) {
        edgeData.label = this.state.label;
        edgeData.from = edgeData.from.id;
        edgeData.to = edgeData.to.id;

        callback(edgeData);
    }

    updateEdge(edge, callback) {
        const updatedEdge = {
            id: edge.id,
            label: edge.label,
            from: edge.from,
            to: edge.to
        };

        const edges = this.state.edges.filter(e => e.id !== edge.id);

        const updatedEdges = [...edges, updatedEdge].sort((a, b) => {
            const aId = a.id;
            const bId = b.id;

            return aId - bId
        });

        this.setState({
            edges: updatedEdges
        }, () => callback());
    }

    onCloseEditEdgeForm() {
        this.inputEditEdgeWeight.value = "";

        this.setState({
            isActiveEditEdgeForm: !this.state.isActiveEditEdgeForm,
            label: null
        });
    }

    //DELETE EDGE METHODS
    deleteEdge(edges) {
        const edgeId = edges[0];
        const updatedEdges = this.state.edges.filter((edge) => edge.id !== edgeId);

        this.setState({edges: updatedEdges});
    }

    deleteEdges(edges) {
        const updatedEdges = this.state.edges.filter(edge => !edges.includes(edge.id));

        this.setState({edges: updatedEdges});
    }

    //EXPORT / IMPORT
    handleExportGraph() {
        const exportArea = document.getElementById('import-area');

        const data = [
          this.props.nodes,
          this.state.edges
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
            this.setState({edges: edges});
        } else {
            this.props.renderMessage("Please, paste the data from the file into the area");
        }
    }

    handleClearArea() {
        this.setState({exportValue: ""});
    }

    render() {
        const {
            idEdit,
            isActiveAddEdgeForm,
            isActiveEditEdgeForm,
            exportValue
        } = this.state;

        return (
          <div className="workspace-wrapper">
              {
                  isActiveAddEdgeForm
                    ? <div className="form-control add-edge-form">
                        <label htmlFor="edge-weigth" className="form-title">Add Edge {this.state.id}</label>
                        <div className="row">
                            <input
                              className="input"
                              ref={ref => this.inputEdgeWeight = ref}
                              id="edge-weight"
                              placeholder="Type weight"
                              onChange={(e) => this.handleChangeEdgeWeight(e)}
                            />
                            <button
                              id="add-edge"
                              className="btn"
                              type="submit"
                            >
                                Create Edge
                            </button>
                        </div>
                    </div>
                    : null
              }

              {
                  isActiveEditEdgeForm
                    ? <div className="form-control edit-edge-form">
                        <label htmlFor="edge-weigth" className="form-title">Edit Edge {idEdit}</label>
                        <div className="row">
                            <input
                              className="input"
                              ref={ref => this.inputEditEdgeWeight = ref}
                              id="edge-weight"
                              placeholder="Type weight"
                              onChange={(e) => this.handleChangeEdgeWeight(e)}
                            />
                            <button
                              id="edit-edge-btn"
                              className="btn"
                              type="submit"
                            >
                                Update Edge
                            </button>
                        </div>
                    </div>
                    : null
              }

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