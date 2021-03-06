import React, {Component} from 'react';
import DrawSpace from "./components/DrawSpace";
import GenerationForm from "./components/GenerationForm";

import Graph from 'graph.js';
import {
    sortByID,
    sortByLabel,
    sortByMaxLength,
    sortByLength
} from "./sort";

import './index.css';
import Planning from "./components/Planning";

class App extends Component {
    constructor() {
        super();

        this.state = {
            graphType: "",
            adjMatrix: {},
            nodesWithLinks: [],
            links: [],

            criticalPath: [],

            nodes: [],
            edges: [],

            sysNodes: [],
            sysEdges: [],

            nodeID: 0,
            edgeID: 0,

            sysNodeID: 0,
            sysEdgeID: 0,

            idEdgeEdit: null,
            idSysEdgeEdit: null,

            //Labels
            nodeWeight: null,
            edgeWeight: null,

            nodeForUpdate: {
                id: "",
                label: ""
            },

            isActiveNodeUpdateForm: false,
            isActiveMessageForm: false,
            isActiveAddEdgeForm: false,
            isActiveEditEdgeForm: false,

            message: "",
            testResults: "",

            queue: [],
            queueIds: [],
            sourceNodes: [],

            processors: null,
            banks: null,

            criticalPathByWeight: {}
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

        this.showTaskGraph = this.showTaskGraph.bind(this);
        this.showSystemGraph = this.showSystemGraph.bind(this);

        this.isCoherent = this.isCoherent.bind(this);
        this.isCycles = this.isCycles.bind(this);

        this.getMatrixObj = this.getMatrixObj.bind(this);
        this.getMatrixArr = this.getMatrixArr.bind(this);

        this.getLinks = this.getLinks.bind(this);

        this.calculate_14 = this.calculate_14.bind(this);
        this.test_14 = this.test_14.bind(this);

        this.calculate_9 = this.calculate_9.bind(this);
        this.test_9 = this.test_9.bind(this);

        this.calculate_5 = this.calculate_5.bind(this);
        this.test_5 = this.test_5.bind(this);

        this.resetGraph = this.resetGraph.bind(this);

        this.handleChangeNumberOfProcessors = this.handleChangeNumberOfProcessors.bind(this);
        this.handleChangeNumberOfBanks = this.handleChangeNumberOfBanks.bind(this);

        this.findCriticalPath = this.findCriticalPath.bind(this);
    }

    componentDidMount() {
        this.setState({graphType: "task"});
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
        if (this.state.graphType === "task") {
            this.setState({
                nodes: [...this.state.nodes, {
                    id: this.state.nodeID,
                    label: this.state.nodeWeight,
                    title: this.state.nodeID
                }],
                nodeID: this.state.nodeID + 1
            }, () => {
                this.resetInputs();
                this.getMatrixObj();
            });
        } else {
            this.setState({
                sysNodes: [...this.state.sysNodes, {
                    id: this.state.sysNodeID,
                    label: this.state.nodeWeight,
                    title: this.state.sysNodeID
                }],
                sysNodeID: this.state.sysNodeID + 1
            }, () => this.resetInputs());
        }
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
        const updatedNode = {
            id: node.id,
            label: node.label,
            title: node.title
        };

        if (this.state.graphType === "task") {
            const nodes = this.state.nodes.filter((n) => n.id !== node.id);
            const updatedNodes = sortByID([...nodes, updatedNode]);

            this.setState({nodes: updatedNodes}, () => {
                this.onCloseEditNodeForm();
                this.getMatrixObj();
            });

        } else {
            const sysNodes = this.state.sysNodes.filter((n) => n.id !== node.id);
            const updatedSysNodes = sortByID([...sysNodes, updatedNode]);

            this.setState({sysNodes: updatedSysNodes}, () => this.onCloseEditNodeForm());
        }
    }

    //DELETE NODE METHOD
    handleDeleteNode(nodes) {
        const nodeId = nodes[0];

        if (this.state.graphType === "task") {
            const updatedNodes = this.state.nodes.filter((node) => node.id !== nodeId);
            this.setState({nodes: updatedNodes}, () => this.getMatrixObj());
        } else {
            const updatedSysNodes = this.state.sysNodes.filter((node) => node.id !== nodeId);
            this.setState({sysNodes: updatedSysNodes});
        }
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

        if (this.state.graphType === "task") {
            data.label = this.state.edgeWeight;
            data.id = this.state.edgeID;

            this.setState({
                edges: [...this.state.edges, {
                    id: data.id,
                    label: data.label,
                    from: data.from,
                    to: data.to
                }],
                edgeID: this.state.edgeID + 1
            }, () => {
                this.onCloseAddEdgeForm();
                this.getMatrixObj();
                callback(data);
            });
        }
        else {
            data.label = "1";
            data.id = this.state.sysEdgeID;

            this.setState({
                sysEdges: [...this.state.sysEdges,
                    {
                        id: data.id,
                        label: data.label,
                        from: data.from,
                        to: data.to
                    },
                    {
                        id: data.id + 1,
                        label: data.label,
                        from: data.to,
                        to: data.from
                    },
                ],
                sysEdgeID: this.state.sysEdgeID + 2
            }, () => callback(data));
        }
    }

    //EDIT EDGE METHODS
    renderEditEdgeForm(edgeData, callback) {
        this.setState({isActiveEditEdgeForm: !this.state.isActiveEditEdgeForm});

        if (this.state.graphType === "task") {
            this.setState({idEdgeEdit: edgeData.id}, () => callback());
        } else {
            this.setState({idSysEdgeEdit: edgeData.id}, () => callback());
        }
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

        if (this.state.graphType === "task") {
            const edges = this.state.edges.filter(e => e.id !== edge.id);
            const updatedEdges = sortByID([...edges, updatedEdge]);

            this.setState({edges: updatedEdges}, () => {
                this.onCloseEditEdgeForm();
                this.getMatrixObj();
            });

        } else {
            const sysEdges = this.state.sysEdges.filter(e => e.id !== edge.id);
            const updatedSysEdges = sortByID([...sysEdges, updatedEdge]);

            this.setState({sysEdges: updatedSysEdges}, () => this.onCloseEditEdgeForm());
        }
    }

    //DELETE EDGE METHOD
    handleDeleteEdges(edges) {
        if (this.state.graphType === "task") {
            const updatedEdges = this.state.edges.filter(edge => !edges.includes(edge.id));
            this.setState({edges: updatedEdges}, () => this.getMatrixObj());
        } else {
            //When deleting Node with outgoing/incoming edges
            if (edges.length > 1) {
                const newSysEdges = this.state.sysEdges.filter(edge => !edges.includes(edge.id));
                this.setState({sysEdges: newSysEdges});

            } else {
                const selectedEdgeID = edges[0];
                const selectedEdge = this.state.sysEdges.find(edge => edge.id === selectedEdgeID);
                const edgePartner = this.state.sysEdges.find(edge => (
                  edge.from === selectedEdge.to && edge.to === selectedEdge.from)
                );
                const newSysEdges = this.state.sysEdges.filter(edge =>
                  edge.id !== selectedEdgeID && edge.id !== edgePartner.id
                );
                this.setState({sysEdges: newSysEdges});
            }
        }
    }

    setNodes(nodes) {
        const maxId = nodes[nodes.length - 1].id;

        if (this.state.graphType === "task") {
            this.setState({
                nodes,
                nodeID: maxId + 1
            }, () => {
                this.getMatrixObj()
            });
        } else {
            this.setState({
                sysNodes: nodes,
                sysNodeID: maxId + 1
            });
        }
    }

    setEdges(edges) {
        const maxId = edges[edges.length - 1].id;

        if (this.state.graphType === "task") {
            this.setState({
                edges,
                edgeID: maxId + 1
            });
        } else {
            this.setState({
                sysEdges: edges,
                sysEdgeID: maxId + 1
            });
        }

    }

    showTaskGraph() {
        this.setState({graphType: "task"});
    }

    showSystemGraph() {
        this.setState({graphType: "system"});
    }

    isCoherent() {
        const {sysNodes, sysEdges} = this.state;
        const graph = new Graph();
        let paths = [];
        let checkedPaths = [];

        sysNodes.forEach(node => graph.addNewVertex(node.id));
        sysEdges.forEach(edge => graph.createNewEdge(edge.from, edge.to));

        sysNodes.forEach(nodeOut => {
            sysNodes.forEach(nodeIn => {
                for (let path of graph.paths(nodeOut.id, nodeIn.id)) {
                    paths.push(path);
                }
            });
        });

        sysNodes.forEach(nodeOut => {
            sysNodes.forEach(nodeIn => {
                checkedPaths.push(
                  paths.find(path => path[0] === nodeOut.id && path[path.length - 1] === nodeIn.id)
                );
            });
        });

        const undefinedPaths = checkedPaths.filter(path => path === undefined);

        if (undefinedPaths.length > 0) {
            this.renderMessage("Graph is not coherent.");
          } else {
            this.renderMessage("Graph is coherent.");
        }
    }

    isCycles() {
        const {links} = this.state;
        const arr = links.map(link => [link]);

        const graph = new Graph(...arr);
        const cycles = graph.cycles();

        let cyclesArr = [];
        let string = "";

        for (let cycle of cycles) {
            cycle.map((e, index) => {
                if(index !== cycle.length - 1) {
                    string += e + " -> ";
                } else {
                    string += e;
                }
            });
            string += "\n";
            cyclesArr.push(cycle);
        }

        if (cyclesArr.length > 0) {
            this.renderMessage('Graph got cycles:\n' + string);
        } else {
            this.renderMessage('Graph doesn\'t have cycles.');
        }
    }

    getMatrixArr() {
        const {nodes, edges} = this.state;

        //Create links Array for Cycle checking
        let linksArr = [];

        edges.forEach((edge) => {
           let innerLinksArr = [];
           innerLinksArr.push(edge['from']);
           innerLinksArr.push(edge['to']);
           linksArr.push(innerLinksArr);
        });

        this.setState({
            links: linksArr
        });

        //Adjacency matrix in Array structure
        let matrix = [];

        nodes.forEach(() => {
            let innerArr = [];
            nodes.forEach(() => innerArr.push(0));
            matrix.push(innerArr);
        });

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix.length; j++) {
                edges.map(edge => {
                    if (edge.from === i && edge.to === j) {
                        matrix[i][j] = parseInt(edge.label, 10);
                    }
                  }
                );
            }
        }
    }

    getMatrixObj() {
        const {nodes, edges} = this.state;

        //Update Array Matrix
        this.getMatrixArr();

        if (nodes.length > 0) {
            let matrix = {};

            nodes.forEach(node => {
                let innerObj = {};
                nodes.forEach(node => innerObj[node.id] = 0);
                matrix[node.id] = innerObj;
            });

            const keys = Object.keys(matrix);

            for (let i = 0; i < keys.length; i++) {
                for (let j = 0; j < keys.length; j++) {

                    edges.map(edge => {
                          if (edge.from === parseInt(keys[i], 10) && edge.to === parseInt(keys[j], 10)) {
                              let keyI = keys[i];
                              let keyJ = keys[j];
                              let obj = matrix[`${keyI}`];
                              obj[`${keyJ}`] = parseInt(edge.label, 10);
                          }
                      }
                    );
                }
            }
            this.setState({
                adjMatrix: matrix
            }, () => this.getLinks());
        }
    }

    getLinks() {
        const {adjMatrix} = this.state;
        let nodesWithLinks = [];
        let allLinks = [];

        const keysArr = Object.keys(adjMatrix);
        const valuesArr = keysArr.map(key => adjMatrix[key]);

        valuesArr.forEach(linksObj => {
            const keys = Object.keys(linksObj);
            let links = [];

            keys.forEach(key => {
                if (linksObj[key] > 0) {
                    links.push(key);
                }
            });

            allLinks.push(links);
        });

        keysArr.map((key, index) => {
            nodesWithLinks.push({
                id: key,
                links: allLinks[index]
            });
        });

        this.setState({nodesWithLinks: nodesWithLinks});
    }

    findCriticalPath() {
    const {nodesWithLinks, nodes} = this.state;
    const graph = new Graph();

    const updatedNodes = nodesWithLinks.map(nodeWithLink => {
      const nodeWithWeight = nodes.find(node => node.id == nodeWithLink.id);
      return {...nodeWithLink, weight: nodeWithWeight.label}
    });

    nodesWithLinks.forEach(node => graph.addNewVertex(node.id));

    nodesWithLinks.forEach(node => {
      if (node.links.length > 0) {
        node.links.forEach(link => graph.createNewEdge(node.id, link));
      }
    });

    let sinkVertices = [];
    for (let [key] of graph.sinks()) {
      sinkVertices.push(key);
    }

    let sourceNodes = [];
    for (let [key] of graph.sources()) {
      sourceNodes.push(key);
    }

    updatedNodes.forEach(node => {
      sourceNodes.forEach(vertice => {
        if (node.id === vertice) {
          node.maxPath = node.weight;
        }
      });
    });

    updatedNodes.map(node => node.maxPath ? "" : node.maxPath = "");

    const sourceVertices = updatedNodes.filter(node => !sinkVertices.includes(node.id));

    let criticalPathSum = null;
    let criticalPath = [];
    sourceVertices.forEach(source => {
      sinkVertices.forEach(sink => {
        let paths = [];

        for (let path of graph.paths(source.id, sink)) {
          paths.push(path);

          let pathWeightsSum = null;
          path.forEach(vertice => {
            const node = updatedNodes.find(n => n.id == vertice);
            pathWeightsSum += node.weight;
          });

          if (pathWeightsSum >= criticalPathSum) {
            criticalPathSum = pathWeightsSum;
            criticalPath = path;
          }

          if (criticalPathSum > source.maxPath){
            source.maxPath = criticalPathSum;
          }
        }
      });
    });

    this.setState({
        criticalPathByWeight: {value: criticalPathSum, path: criticalPath}
        }, () => console.log("Critical path:", this.state.criticalPathByWeight)
    );
  }

    calculate_14() {
        this.findCriticalPath();
        const {nodes, nodesWithLinks} = this.state;
        const sortedNodes = sortByLabel(nodes);
        const copyNodesWithLinks = [...nodesWithLinks];

        const sortedQueue = copyNodesWithLinks.map(node => {
            const accordingNodeFromQueue = sortedNodes.find(element => element.id == node.id);
            node.label = accordingNodeFromQueue.label;
            return node
        });

        return sortedQueue
    }

    test_14() {
        const {edges, nodesWithLinks} = this.state;
        const sortedNodes = this.calculate_14();
        const queue = [...sortedNodes];
        const queueIds = [];

        const graph = new Graph();

        nodesWithLinks.forEach(node => graph.addNewVertex(node.id));

        nodesWithLinks.forEach(node => {
            if (node.links.length > 0) {
                node.links.forEach(link => graph.createNewEdge(node.id, link));
            }
        });

        let sourceNodes = [];
        for (let [key] of graph.sources()) {
            sourceNodes.push(key);
        }

        let result = "Test 14:\n";

        sortedNodes.forEach(node => {
            result += node.id + "(" + node.label + ")  ";
        });

        queue.forEach(node => {
            queueIds.push(`${node.id}`);

            edges.forEach(edge => {
                if (edge.to == node.id) {
                    if (Array.isArray(node.parents)) {
                        node.parents.push(`${edge.from}`);
                    } else {
                        node.parents = [`${edge.from}`]
                    }
                }
            })
        });

        console.log("queue", queue);
        console.log("queueIds", queueIds);

        this.setState({testResults: result, queue, queueIds, sourceNodes});
    }

    calculate_9() {
        this.findCriticalPath();
        //Getting vertices that have no incoming edges (source vertices)
        const {nodesWithLinks} = this.state;
        const graph = new Graph();

        nodesWithLinks.forEach(node => graph.addNewVertex(node.id));

        nodesWithLinks.forEach(node => {
            if (node.links.length > 0) {
                node.links.forEach(link => graph.createNewEdge(node.id, link));
            }
        });

        let sourceVertices = [];
        for (let [key] of graph.sources()) {
            sourceVertices.push(key);
        }

        //Set new prop of Node, maxLength, to 1 for source nodes
        const copyNodesWithLinks = [...nodesWithLinks];
        copyNodesWithLinks.forEach(node => {
            sourceVertices.forEach(vertice => {
                if (node.id === vertice) {
                    node.maxLength = 1;
                }
            });
        });
        copyNodesWithLinks.map(node => node.maxLength ? "" : node.maxLength = "");

        const sourceNodes = copyNodesWithLinks.filter(node => sourceVertices.includes(node.id));
        const notSourceNodes = copyNodesWithLinks.filter(node => !sourceVertices.includes(node.id));

        sourceVertices.forEach(source => {
            notSourceNodes.forEach(node => {
                let paths = [];

                for (let path of graph.paths(source, node.id)) {
                    paths.push(path);

                    if (path.length > node.maxLength){
                        node.maxLength = path.length;
                    }
                }
            });
        });
        this.setState({sourceNodes: sourceVertices});

        return sortByMaxLength([...sourceNodes, ...notSourceNodes]);
    }

    test_9() {
        const {edges} = this.state;
        const sortedNodes = this.calculate_9();
        const queue = [...sortedNodes];
        const queueIds = [];

        let result = "Test 9:\n";

        sortedNodes.forEach(node => {
            result += node.id + "(" + node.maxLength + ")  ";
        });

        queue.forEach(node => {
            queueIds.push(`${node.id}`);

            edges.forEach(edge => {
                if (edge.to == node.id) {
                    if (Array.isArray(node.parents)) {
                        node.parents.push(`${edge.from}`);
                    } else {
                        node.parents = [`${edge.from}`]
                    }
                }
            })
        });

        console.log("queue", queue);
        console.log("queueIds", queueIds);

        this.setState({testResults: result, queue, queueIds});
    }

    calculate_5() {
        this.findCriticalPath();
        //Getting vertices that have no outgoing edges (sink vertices)
        const {nodesWithLinks} = this.state;
        const graph = new Graph();

        nodesWithLinks.forEach(node => graph.addNewVertex(node.id));

        nodesWithLinks.forEach(node => {
            if (node.links.length > 0) {
                node.links.forEach(link => graph.createNewEdge(node.id, link));
            }
        });

        let sinkVertices = [];
        for (let [key] of graph.sinks()) {
            sinkVertices.push(key);
        }

        let sourceNodes = [];
        for (let [key] of graph.sources()) {
            sourceNodes.push(key);
        }

        //Set new prop of Node, maxLength, to 1 for sink nodes
        const copyNodesWithLinks = [...nodesWithLinks];
        copyNodesWithLinks.forEach(node => {
            sinkVertices.forEach(vertice => {
                if (node.id === vertice) {
                    node.maxLength = 1;
                }
            });
        });
        copyNodesWithLinks.map(node => node.maxLength ? "" : node.maxLength = "");

        const sinkNodes = copyNodesWithLinks.filter(node => sinkVertices.includes(node.id));
        const sourceVertices = copyNodesWithLinks.filter(node => !sinkVertices.includes(node.id));

        let criticalPath = [];
        sourceVertices.forEach(source => {
            sinkVertices.forEach(sink => {
                let paths = [];

                for (let path of graph.paths(source.id, sink)) {
                    paths.push(path);

                    if (path.length >= criticalPath.length) {
                        criticalPath = path;
                    }

                    if (path.length > source.maxLength){
                        source.maxLength = path.length;
                    }
                }
            });
        });
        this.setState({criticalPath: criticalPath, sourceNodes});

        return {sortedNodes: sortByMaxLength([...sinkNodes, ...sourceVertices]), criticalPath};
    }

    test_5() {
        const {edges, nodesWithLinks} = this.state;
        const {sortedNodes, criticalPath} = this.calculate_5();

        let result = "Test 5:\n";

        criticalPath.forEach(id => result += id + " ");

        const filteredNodes = sortedNodes.filter(node => !criticalPath.includes(node.id));
        const sortedOtherNodes = sortByLength(filteredNodes);

        sortedOtherNodes.forEach(node => result += node.id + "(" + node.maxLength + ")  ");

        //console.log(criticalPath, sortedOtherNodes);
        const criticalPathWithLinks = nodesWithLinks.filter(node => criticalPath.includes(node.id));

        const queue = [...criticalPathWithLinks, ...sortedOtherNodes];
        const queueIds = [];

        queue.forEach(node => {
            queueIds.push(`${node.id}`);

            edges.forEach(edge => {
                if (edge.to == node.id) {
                    if (Array.isArray(node.parents)) {
                        node.parents.push(`${edge.from}`);
                    } else {
                        node.parents = [`${edge.from}`]
                    }
                }
            })
        });

        console.log("queue", queue);
        console.log("queueIds", queueIds);

        this.setState({testResults: result, queue, queueIds});
    }

    resetGraph(callback) {
        this.setState({
            nodes: [],
            edges: []
        }, () => callback());
    }

    handleChangeNumberOfProcessors(e) {
        this.setState({processors: e.target.value});
    }

    handleChangeNumberOfBanks(e) {
        this.setState({banks: e.target.value});
    }

    render() {
        const {
            nodes,
            edges,

            nodeID,
            edgeID,

            sysNodeID,
            sysEdgeID,

            graphType,
            message,
            isActiveNodeUpdateForm,
            isActiveAddEdgeForm,
            isActiveMessageForm,
            isActiveEditEdgeForm,

            idEdgeEdit,
            idSysEdgeEdit,

            testResults,
            queue,
            queueIds,
            sourceNodes,
            processors,
            banks
        } = this.state;

        return (
          <div className="App">
              <div className="forms-wrapper">
                  <div className="form-control add-node-form">
                      <label htmlFor="node-weigth" className="form-title">Add Node, id:
                          {(graphType === "task") ? nodeID : sysNodeID}
                      </label>
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
                            <label htmlFor="edge-weigth" className="form-title">Add Edge, id:
                                {(graphType === "task") ? edgeID : sysEdgeID}
                            </label>
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
                            <label htmlFor="edge-weigth" className="form-title">Edit Edge, id:
                                {(graphType === "task") ? idEdgeEdit : idSysEdgeEdit}
                            </label>
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

              <div className="tabs-container">
                  <button
                    className={`btn tab-link ${(graphType === "task") ? "active" : ""}`}
                    onClick={this.showTaskGraph}
                  >
                      Task Graph
                  </button>
                  <button
                    className={`btn tab-link ${(graphType === "system") ? "active" : ""}`}
                    onClick={this.showSystemGraph}
                  >
                      System Graph
                  </button>

                  <div className="form-control planner">
                      <div className="cell">
                          <label htmlFor="processors" className="form-title">Number of processors:</label>
                          <input
                            className="input"
                            id="processors"
                            placeholder="Type number"
                            onChange={(e) => this.handleChangeNumberOfProcessors(e)}
                          />
                      </div>
                      <div className="cell">
                          <label htmlFor="banks" className="form-title">Number of banks:</label>
                          <input
                            className="input"
                            id="banks"
                            placeholder="Type number"
                            onChange={(e) => this.handleChangeNumberOfBanks(e)}
                          />
                      </div>
                  </div>
              </div>

              {
                  (graphType === "task")
                    ? <div className="content-container">
                        <div className="header-container">
                            <h1 className="title">{graphType} graph</h1>
                            <button
                              className="btn blue"
                              id="btn-test"
                              onClick={this.test_5}
                            >Test 5
                            </button>
                            <button
                              className="btn blue"
                              id="btn-test"
                              onClick={this.test_9}
                            >Test 9
                            </button>
                            <button
                              className="btn blue"
                              id="btn-test"
                              onClick={this.test_14}
                            >Test 14
                            </button>
                            <button
                              className="btn red"
                              id="btn-check"
                              onClick={this.isCycles}
                            >Check for cycles
                            </button>
                        </div>

                      <GenerationForm
                        setNodes={this.setNodes}
                        setEdges={this.setEdges}
                        resetGraph={this.resetGraph}
                      />

                        <DrawSpace
                          graphType={graphType}
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

                          testResults={testResults}
                        />
                      <Planning
                        queue={queue}
                        queueIds={queueIds}
                        nodes={nodes}
                        edges={edges}
                        sourceNodes={sourceNodes}
                        processors={processors}
                        // processors={5}
                        banks={banks}
                        // banks={3}
                      />
                    </div>

                    : <div className="content-container">
                        <div className="header-container">
                            <h1 className="title">{graphType} graph</h1>
                            <button
                              id="btn-check"
                              className="btn red"
                              onClick={this.isCoherent}
                            >Check coherent
                            </button>
                        </div>
                        <DrawSpace
                          graphType={graphType}
                          nodes={this.state.sysNodes}
                          edges={this.state.sysEdges}

                          handleUpdateNode={this.handleUpdateNode}
                          handleDeleteNode={this.handleDeleteNode}

                          handleCreateEdge={this.handleCreateEdge}
                          handleCreateSysEdge={this.handleCreateSysEdge}
                          handleUpdateEdge={this.handleUpdateEdge}
                          handleDeleteEdges={this.handleDeleteEdges}

                          setNodes={this.setNodes}
                          setEdges={this.setEdges}

                          renderMessage={this.renderMessage}
                          renderAddEdgeForm={this.renderAddEdgeForm}
                          renderEditEdgeForm={this.renderEditEdgeForm}
                          renderEditNodeForm={this.renderEditNodeForm}
                        />
                    </div>
              }
          </div>
        );
    }
}

export default App;
