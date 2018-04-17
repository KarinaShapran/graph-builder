import React, {Component} from 'react';
import DrawSpace from "./components/DrawSpace";

import './index.css';

class App extends Component {
    constructor() {
        super();

        this.state = {
            id: 0,
            nodeWeight: null,
            nodes: [],
            edges: [],
            nodeForUpdate: {
                id: "",
                label: ""
            },
            stringNodes: "",

            isActiveNodeUpdateForm: false,
            isActiveMessageForm: false,
            message: ""
        };

        this.handleChangeNodeWeight = this.handleChangeNodeWeight.bind(this);
        this.handleCreateNode = this.handleCreateNode.bind(this);

        this.resetInputs = this.resetInputs.bind(this);

        this.renderMessage = this.renderMessage.bind(this);
        this.handleClickOK = this.handleClickOK.bind(this);

        this.onCloseEditNodeForm = this.onCloseEditNodeForm.bind(this);
        this.renderEditNodeForm = this.renderEditNodeForm.bind(this);

        this.updateNode = this.updateNode.bind(this);
        this.deleteNode = this.deleteNode.bind(this);
        this.setNodes = this.setNodes.bind(this);
        this.showNodes = this.showNodes.bind(this);

        this.saveEditedNodeData = this.saveEditedNodeData.bind(this);
    }

    //ERROR MESSAGES
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

    handleChangeNodeWeight(e) {
        this.setState({
            nodeWeight: e.target.value
        });
    }

    handleCreateNode() {
        this.setState({
            nodes: [...this.state.nodes, {
                id: this.state.id,
                label: this.state.nodeWeight,
                title: this.state.id
            }],
            id: this.state.id + 1
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

    saveEditedNodeData(data, callback) {
        data.label = this.inputNodeEdit.value;
        callback(data);
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

    deleteNode(nodes) {
        const nodeId = nodes[0];
        const updatedNodes = this.state.nodes.filter((node) => node.id !== nodeId);

        this.setState({
            nodes: updatedNodes
        });
    }

    setNodes(nodes) {
        const maxId = nodes[nodes.length - 1].id;

        this.setState({
            nodes,
            id: maxId + 1
        })
    }

    showNodes(obj) {
        const stringData = JSON.stringify(obj);
        this.setState({
            stringNodes: stringData
        })
    }

    render() {
        const {
            message,
            isActiveNodeUpdateForm,
            // isActiveAddEdgeForm,
            isActiveMessageForm
            // isActiveEditEdgeForm,
            // exportValue
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
              </div>
              <DrawSpace
                nodes={this.state.nodes}
                edges={this.state.edges}

                updateNode={this.updateNode}
                deleteNode={this.deleteNode}

                setNodes={this.setNodes}

                renderMessage={this.renderMessage}

                saveEditedNodeData={this.saveEditedNodeData}
                renderEditNodeForm={this.renderEditNodeForm}
              />
              <textarea id="import-area" value={this.state.stringNodes}/>

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
