import React, { Component } from 'react';

import vis from 'vis/dist/vis';
import 'vis/dist/vis.css';
// import '../index.css';

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

            nodeForUpdate: {
                id: "",
                label: ""
            },
            edgeForUpdate: {
                id: "",
                from: "",
                to: "",
                label: ""
            },

            isActiveNodeUpdateForm: false,
            isActiveAddEdgeForm: false,
            isActiveMessageForm: false,
            isActiveEditEdgeForm: false,
            message: ""
        };

        this.drawGraph = this.drawGraph.bind(this);

        this.renderMessage = this.renderMessage.bind(this);
        this.renderEditNodeForm = this.renderEditNodeForm.bind(this);
        this.renderAddEdgeForm = this.renderAddEdgeForm.bind(this);
        this.renderEditEdgeForm = this.renderEditEdgeForm.bind(this);

        this.onCloseEditNodeForm = this.onCloseEditNodeForm.bind(this);
        this.onCloseAddEdgeForm = this.onCloseAddEdgeForm.bind(this);
        this.onCloseEditEdgeForm = this.onCloseEditEdgeForm.bind(this);

        this.handleCreateEdge = this.handleCreateEdge.bind(this);
        this.handleClickOK = this.handleClickOK.bind(this);

        this.updateEdge = this.updateEdge.bind(this);
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
            locale: 'ru',
            autoResize: false,
            height: '100%',
            width: '100%',
            nodes: {
                shape: 'ellipse'
            },
            edges:{
                arrows: {
                    to:     {enabled: true, scaleFactor:1, type:'arrow'},
                    from:   {enabled: false, scaleFactor:1, type:'arrow'}
                },
                font: {
                    color: '#343434',
                    size: 14
                }
            },
            manipulation: {
                addNode: false,

                // Editing Node
                editNode: function (data, callback) {
                    self.renderEditNodeForm(data, () =>
                      document.getElementById('update-node-btn').onclick = () => {
                        self.saveEditedNodeData(data, self.inputUpdate, callback);
                        self.props.updateNode(data, self.onCloseEditNodeForm);
                        }
                    );
                  },

                //Adding Edge
                addEdge: function (edgeData, callback) {
                      if (edgeData.from === edgeData.to) {
                          self.renderMessage("Can't connect the node to itself");
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
                    editWithoutDrag: function (edgeData, callback) {
                        self.renderEditEdgeForm(edgeData, () =>
                          document.getElementById('edit-edge-btn').onclick = () => {
                              // self.handleUpdateEdge(edgeData, callback);
                              self.handleUpdateEdge(edgeData, callback);
                              self.updateEdge(edgeData, self.onCloseEditEdgeForm);
                          }
                        );
                    }
                },

                //Deleting Node
                deleteNode: function (data, callback) {
                    self.props.deleteNode(data.nodes[0]);
                    callback(data);
                },
                deleteEdge: true
            },
        };

        const data = { nodes: nodes, edges: edges };
        const container = document.getElementById('mynetwork');
        const network = new vis.Network(container, data, options);

        this.props.updateNodes(network.body.data.nodes._data);
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

    //EDIT NODE METHODS
    renderEditNodeForm(node, callback) {
        this.setState({
            isActiveNodeUpdateForm: !this.state.isActiveNodeUpdateForm,
            nodeForUpdate: {
                id: node.id,
                label: node.label
            }
        }, () => callback());
    }

    saveEditedNodeData(data, ref, callback) {
        data.label = ref.value;
        callback(data);
    }

    onCloseEditNodeForm() {
        this.setState({
            isActiveNodeUpdateForm: !this.state.isActiveNodeUpdateForm
        });
        this.inputUpdate.value = "";
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
        data.id = this.state.id++;

        this.setState({
            edges: [...this.state.edges, {
                id: data.id,
                label: this.state.label,
                from: data.from,
                to: data.to
            }]
        }, () => { callback(); defaultCallback(data); console.log("Added edge:", data) } );
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
        console.log("Render Edit", edgeData)
        this.setState({
            isActiveEditEdgeForm: !this.state.isActiveEditEdgeForm,
            idEdit: edgeData.id
        }, () => callback());
    }

    handleUpdateEdge(edgeData, callback) {
        console.log(edgeData);
        edgeData.label = this.state.label;
        edgeData.from = edgeData.from.id;
        edgeData.to = edgeData.to.id;

        callback(edgeData);
    }

    updateEdge(edge, callback) {
        let updatedEdge = {
            id: edge.id,
            label: edge.label,
            from: edge.from,
            to: edge.to
        };

        let edges = this.state.edges.filter( function( obj ) {
            return obj.id !== edge.id;
        });

        console.log("Filter", edges);

        let updatedEdges = [...edges, updatedEdge].sort( (a,b) => {
            const aId = a.id;
            const bId = b.id;

            return aId - bId
        });

        console.log("Updated edges", updatedEdges);

        this.setState({
            edges: updatedEdges
        }, () => callback() );
    }


    onCloseEditEdgeForm() {
        this.inputEditEdgeWeight.value = "";

        this.setState({
            isActiveEditEdgeForm: !this.state.isActiveEditEdgeForm,
            label: null
        });
    }

    render() {
        const {
            idEdit,
            message,
            isActiveNodeUpdateForm,
            isActiveAddEdgeForm,
            isActiveMessageForm,
            isActiveEditEdgeForm
        } = this.state;

        return (
          <div className="workspace-wrapper">
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
                            ref={ref => this.inputUpdate = ref}
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
          </div>
        );
    }
}