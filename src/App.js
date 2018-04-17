import React, {Component} from 'react';
import DrawSpace from "./components/DrawSpace";

import './index.css';

class App extends Component {
    constructor() {
        super();

        this.state = {
            nodeID: 0,
            edgeID: 0,
            idEdgeEdit: null,

            //Labels
            nodeWeight: null,
            edgeWeight: null,

            nodes: [],
            edges: [],
            nodeForUpdate: {
                id: "",
                label: ""
            },

            stringNodes: "",
            stringEdges: "",

            isActiveNodeUpdateForm: false,
            isActiveMessageForm: false,
            isActiveAddEdgeForm: false,
            isActiveEditEdgeForm: false,

            message: ""
        };

        this.handleChangeNodeWeight = this.handleChangeNodeWeight.bind(this);
        this.handleChangeEdgeWeight = this.handleChangeEdgeWeight.bind(this);

        this.handleCreateNode = this.handleCreateNode.bind(this);
        this.handleUpdateNode = this.handleUpdateNode.bind(this);
        this.updateNode = this.updateNode.bind(this);
        this.handleDeleteNode = this.handleDeleteNode.bind(this);

        this.handleCreateEdge = this.handleCreateEdge.bind(this);
        this.handleUpdateEdge = this.handleUpdateEdge.bind(this);
        this.updateEdge = this.updateEdge.bind(this);
        this.handleDeleteEdges = this.handleDeleteEdges.bind(this);

        this.renderEditNodeForm = this.renderEditNodeForm.bind(this);
        this.onCloseEditNodeForm = this.onCloseEditNodeForm.bind(this);

        this.renderAddEdgeForm = this.renderAddEdgeForm.bind(this);
        this.onCloseAddEdgeForm = this.onCloseAddEdgeForm.bind(this);

        this.renderEditEdgeForm = this.renderEditEdgeForm.bind(this);
        this.onCloseEditEdgeForm = this.onCloseEditEdgeForm.bind(this);

        this.setNodes = this.setNodes.bind(this);
        this.setEdges = this.setEdges.bind(this);

        this.resetInputs = this.resetInputs.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.handleClickOK = this.handleClickOK.bind(this);

        this.showNodes = this.showNodes.bind(this);
        this.showEdges = this.showEdges.bind(this);
    }

    //SYSTEM MESSAGE
    renderMessage(text) {
        this.setState({
            isActiveMessageForm: !this.state.isActiveMessageForm,
            message: text
        });
    }

    handleClickOK() {
        this.setState({
            message: "",
            isActiveMessageForm: !this.state.isActiveMessageForm
        });
    }

    //ADD NODE METHODS
    handleChangeNodeWeight(e) {
        this.setState({nodeWeight: e.target.value});
    }

    handleCreateNode() {
        this.setState({
            nodes: [...this.state.nodes, {
                id: this.state.nodeID,
                label: this.state.nodeWeight,
                title: this.state.nodeID
            }],
            nodeID: this.state.nodeID + 1
        }, () => {
            this.resetInputs();
            this.showNodes(this.state.nodes);
        });
    }

    resetInputs() {
        this.setState({nodeWeight: null});
        this.inputNodeWeight.value = "";
    }

    //EDIT NODE METHODS
    renderEditNodeForm(node, callback) {
        this.setState({
            isActiveNodeUpdateForm: !this.state.isActiveNodeUpdateForm,
            nodeForUpdate: {
                id: node.id,
                label: node.label,
                title: node.title
            }
        }, () => callback());
    }

    handleUpdateNode(data, callback) {
        data.label = this.inputNodeEdit.value;
        callback(data);
        this.updateNode(data);
    }

    onCloseEditNodeForm() {
        this.setState({
            isActiveNodeUpdateForm: !this.state.isActiveNodeUpdateForm
        });
        this.inputNodeEdit.value = "";
    }

    updateNode(node) {
        let updatedNode = {
            id: node.id,
            label: node.label,
            title: node.title
        };

        const nodes = this.state.nodes.filter((n) => n.id !== node.id);

        const updatedNodes = [...nodes, updatedNode].sort((a, b) => {
            const aId = a.id;
            const bId = b.id;

            return aId - bId
        });

        this.setState({
            nodes: updatedNodes
        }, () => {
            this.onCloseEditNodeForm();
            this.showNodes(this.state.nodes);
        });
    }

    handleDeleteNode(nodes) {
        const nodeId = nodes[0];
        const updatedNodes = this.state.nodes.filter((node) => node.id !== nodeId);

        this.setState({nodes: updatedNodes}, () => this.showNodes(this.state.nodes));
    }

    //ADD EDGE METHODS
    renderAddEdgeForm(edge, callback) {
        this.setState({
            isActiveAddEdgeForm: !this.state.isActiveAddEdgeForm
        }, () => callback());
    }

    onCloseAddEdgeForm() {
        this.setState({
            isActiveAddEdgeForm: !this.state.isActiveAddEdgeForm,
            edgeWeight: null
        });
        this.inputEdgeWeight.value = "";
    }

    handleChangeEdgeWeight(e) {
        this.setState({edgeWeight: e.target.value});
    }

    handleCreateEdge(data, callback) {
        data.label = this.state.edgeWeight;
        data.id = this.state.edgeID;

        this.setState({
            edges: [...this.state.edges, {
                id: data.id,
                label: this.state.edgeWeight,
                from: data.from,
                to: data.to
            }],
            edgeID: this.state.edgeID + 1
        }, () => {
            this.onCloseAddEdgeForm();
            this.showEdges(this.state.edges);
            callback(data);
        });
    }

    //EDIT EDGE METHODS
    renderEditEdgeForm(edgeData, callback) {
        this.setState({
            isActiveEditEdgeForm: !this.state.isActiveEditEdgeForm,
            idEdgeEdit: edgeData.id
        }, () => callback());
    }

    onCloseEditEdgeForm() {
        this.inputEditEdgeWeight.value = "";

        this.setState({
            isActiveEditEdgeForm: !this.state.isActiveEditEdgeForm,
            edgeWeight: null
        });
    }

    handleUpdateEdge(edgeData, callback) {
        edgeData.label = this.state.edgeWeight;
        edgeData.from = edgeData.from.id;
        edgeData.to = edgeData.to.id;

        callback(edgeData);
        this.updateEdge(edgeData);
    }

    updateEdge(edge) {
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

        this.setState({edges: updatedEdges}, () => {
            this.onCloseEditEdgeForm();
            this.showEdges(this.state.edges);
        });
    }

    //DELETE EDGE METHODS
    handleDeleteEdges(edges) {
        const updatedEdges = this.state.edges.filter(edge => !edges.includes(edge.id));

        this.setState({edges: updatedEdges}, () => this.showEdges(this.state.edges));
    }

    setNodes(nodes) {
        const maxId = nodes[nodes.length - 1].id;

        this.setState({
            nodes,
            nodeID: maxId + 1
        }, () => this.showNodes(this.state.nodes))
    }

    setEdges(edges) {
        const maxId = edges[edges.length - 1].id;

        this.setState({
            edges,
            edgeID: maxId + 1
        }, () => this.showEdges(this.state.edges))
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
        const {
            message,
            isActiveNodeUpdateForm,
            isActiveAddEdgeForm,
            isActiveMessageForm,
            isActiveEditEdgeForm,
            idEdgeEdit
        } = this.state;

        return (
          <div className="App">
              <div className="forms-wrapper">
                  {
                      isActiveMessageForm
                        ? <div className="form-control message-popup">
                            <span className="messages">{message}</span>
                            <button
                              id="ok-btn"
                              className="btn purple"
                              type="submit"
                              onClick={this.handleClickOK}
                            >
                                OK
                            </button>
                        </div>
                        : null
                  }
                  {
                      isActiveNodeUpdateForm
                        ? <div className="form-control update-form">
                            <span className="form-title">Update Node {this.state.nodeForUpdate.id}</span>

                            <div className="row">
                                <input
                                  id="label"
                                  className="input purple"
                                  ref={ref => this.inputNodeEdit = ref}
                                  placeholder="Type weight"
                                />
                                <button
                                  id="update-node-btn"
                                  className="btn purple"
                                  type="submit"
                                >
                                    Update Node
                                </button>
                            </div>
                        </div>
                        : null
                  }
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
                            <label htmlFor="edge-weigth" className="form-title">Edit Edge {idEdgeEdit}</label>
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
              </div>
              <DrawSpace
                nodes={this.state.nodes}
                edges={this.state.edges}

                handleUpdateNode={this.handleUpdateNode}
                handleDeleteNode={this.handleDeleteNode}

                handleCreateEdge={this.handleCreateEdge}
                handleUpdateEdge={this.handleUpdateEdge}
                handleDeleteEdges={this.handleDeleteEdges}

                setNodes={this.setNodes}
                setEdges={this.setEdges}

                renderMessage={this.renderMessage}
                renderAddEdgeForm={this.renderAddEdgeForm}
                renderEditEdgeForm={this.renderEditEdgeForm}
                renderEditNodeForm={this.renderEditNodeForm}
              />
              <textarea id="import-area" value={this.state.stringNodes}/>
              <textarea id="import-area" value={this.state.stringEdges}/>

              <div className="form-control add-node-form">
                  <label htmlFor="node-weigth" className="form-title">Add Node {this.state.id}</label>
                  <div className="row">
                      <input
                        className="input"
                        ref={ref => this.inputNodeWeight = ref}
                        id="node-weight"
                        placeholder="Type weight"
                        onChange={(e) => this.handleChangeNodeWeight(e)}
                      />
                      <button
                        className="btn"
                        type="submit"
                        onClick={this.handleCreateNode}
                      >
                          Create Node
                      </button>
                  </div>
              </div>
          </div>
        );
    }
}

export default App;
