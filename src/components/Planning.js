import React, { Component } from 'react';
import Graph from 'graph.js';

export default class Planning extends Component {

    constructor() {
        super();
        this.state = {
            processors: [
              {id: 0, isFree: true, actionsList: [], computing: "", completedComputing: [], writing: ''},
              {id: 1, isFree: true, actionsList: [], computing: "", completedComputing: [], writing: ''},
              {id: 2, isFree: true, actionsList: [], computing: "", completedComputing: [], writing: ''}],
            banks: [
                {id: 0, isFree: true, actionsList: [], currentAction: ""},
                {id: 1, isFree: true, actionsList: [], currentAction: ""},
            ],
            banksData: [],
            tact: 1,
            queue: [],
            mode: 1,
        };

        this.modeling = this.modeling.bind(this);
        this.isParentsDataComputed = this.isParentsDataComputed.bind(this);
        this.startWriting = this.startWriting.bind(this);
        this.startComputing = this.startComputing.bind(this);
        this.stopProcess = this.stopProcess.bind(this);
    }

    componentDidUpdate (prevProps) {

        if (!prevProps.queue.length && this.props.queue.length) {
            console.log(this.props.queue);

            const queueWithoutMaxLength = this.props.queue.map(queueNode => {
                const {maxLength, links, parents, ...rest} = queueNode;

                if (parents) {
                    return {...rest, links: parents, outcomingLinks: links};
                }
                return {...rest, outcomingLinks: links};
            });

            const queueWithWeigth = queueWithoutMaxLength.map(node => {
                const nodeWithWeight = this.props.nodes.find(n => n.id == node.id);

                return {...node, weight: nodeWithWeight.label}
            });

            this.props.sourceNodes.forEach(sourceNodeId => {
                const node = queueWithWeigth.find(node => node.id == sourceNodeId);

                node.isReadyToCompute = true;
            });

            this.setState({
                queue: queueWithWeigth
            });
        } else if (this.props.queue.length) {
            this.modeling();
        }


    }

    isParentsDataComputed (queue, node) {
        const nodesItDepentOn = queue.filter(queueNode => node.links.includes(queueNode.id));
        const areAllReady = nodesItDepentOn.every(n => n.isComputed === true);

        return areAllReady
    }

    startWriting(updatedQueue, freeBanks, freeProcessors, queueIds, edges, tact) {
        const computedNodes = updatedQueue.filter(queueNode => queueNode.isComputed && !queueNode.isWritten);

        freeProcessors.forEach((freeProcessor, index) => {
            computedNodes.filter(node => freeProcessor.completedComputing.includes(node.id)).forEach(computedNode => {
                const reallyFreeBank = freeBanks.find(exFreeBank => exFreeBank.isFree);

                if (freeProcessor.isFree && computedNode.writeStarted === undefined && reallyFreeBank) {
                    const connectedNodesStatusList = [];
                    let minQueueIndex = 9999;
                    computedNode.outcomingLinks.forEach(outcomingLink => {
                        const connectedNode = updatedQueue.find(qN => qN.id === outcomingLink);
                        connectedNodesStatusList.push({id: connectedNode.id, areParentsComputed: this.isParentsDataComputed(updatedQueue, connectedNode)});
                    });

                    const computedNodesToBeTransfered = connectedNodesStatusList.filter(node => node.areParentsComputed);
                    let computedNodeToBeTransfered = null;

                    if (computedNodesToBeTransfered.length === 1) {
                        computedNodeToBeTransfered = computedNodesToBeTransfered[0];
                    } else {
                        const sorted = computedNodesToBeTransfered.sort((a, b) => queueIds.indexOf(a.id) - queueIds.indexOf(b.id));
                        computedNodeToBeTransfered = sorted[0];
                    }

                    if (computedNodeToBeTransfered) {
                        const edgeWeight = edges.find(edge => ((`${edge.from}` === computedNode.id) && (`${edge.to}` === computedNodeToBeTransfered.id))).label;
                        computedNode.writeStarted = tact;
                        computedNode.tactsToWrite = edgeWeight;
                        freeProcessor.isFree = false;
                        freeProcessor.writing = computedNode.id;
                        freeProcessor.actionsList.push(`W${computedNode.id}`);
                        reallyFreeBank.isFree = false;
                        reallyFreeBank.currentAction = computedNode.id;
                        reallyFreeBank.actionsList.push(`W${computedNode.id}`);
                    }
                }
            });
        });

        freeBanks.filter(exFreeBank => exFreeBank.isFree).forEach(freeBank => {freeBank.actionsList.push('_')})
    }

    startComputing(updatedQueue, updatedProcessors, tact) {
        const freeProcessorsAfterWriting = updatedProcessors.filter(updatedProcessor => updatedProcessor.isFree);

        // For each free processor
        freeProcessorsAfterWriting.forEach(freeProcessor => {
            // Get first node from queue which is readyToCompute, is not started
            const nodeToCompute = updatedQueue.find(
              queueNode => queueNode.isReadyToCompute && queueNode.started === undefined
            );

            // If there is node that can be started to be completed in this tact
            if (nodeToCompute) {
                // Set the number of started tact
                nodeToCompute.started = tact;
                freeProcessor.isFree = false;
                freeProcessor.computing = nodeToCompute.id;
                freeProcessor.actionsList.push(nodeToCompute.id)
            }
        });
    }

    stopProcess({updatedQueue, updatedProcessors, updatedBanks, bankAction, tact, banksData, startedField, finishedField, isDoneField, processing, weight, callback}) {
        const startedNotFinished = updatedQueue.filter(
          queueNode => queueNode[startedField] !== undefined && queueNode[finishedField] === undefined
        );

        startedNotFinished.forEach(startedNotFinishedItem => {
            if (tact - startedNotFinishedItem[startedField] === Number.parseInt(startedNotFinishedItem[weight]) - 1) {
                startedNotFinishedItem[finishedField] = tact;
            }
        });

        const writtenInCurrentTact = updatedQueue.filter(queueNode => queueNode[finishedField] === tact);
        writtenInCurrentTact.forEach(node => {
            node[isDoneField] = true;

            const processorToSetFree = updatedProcessors.find(
              updatedProcessor => {
                  return updatedProcessor[processing] === node.id
              }
            );

            processorToSetFree[processing] = '';
            processorToSetFree.isFree = true;
            if (processing === 'computing') {
                processorToSetFree.completedComputing.push(node.id);
            } else {
                callback(node.id);
            }

            if (processing === 'writing') {
                const bankToSetFree = updatedBanks.find(
                  updatedBank => updatedBank.currentAction === node.id
                );

                bankToSetFree.currentAction = '';
                bankToSetFree.isFree = true;
            }
        });
    }

    modeling() {
        const {processors, banks, tact, queue, banksData} = this.state;
        const {nodes, sourceNodes, queueIds, edges} = this.props;

        const updatedQueue = [...queue];
        const updatedProcessors = [...processors];
        const updatedBanks = [...banks];

        const freeBanks = updatedBanks.filter(bank => bank.isFree);
        const busyBanks = updatedBanks.filter(bank => !bank.isFree);
        const freeProcessors = updatedProcessors.filter(processor => processor.isFree);
        const busyProcessors = updatedProcessors.filter(processor => !processor.isFree);

        // if (updatedQueue.find(node => node.isComputed === undefined)) {
        if (tact < 15) {
            console.log('tact', tact);

            // At the very beginning of tact set isReadyToCompute = true for nodes that depend on recently finished nodes
            queue.forEach(node => {
               if (!node.isReadyToCompute) {
                   if (this.isParentsDataComputed(queue, node)) {
                       node.isReadyToCompute = true;
                   }
               }
            });

            busyBanks.forEach(busyBank => {
               busyBank.actionsList.push(`W${busyBank.currentAction}`)
            });
            busyProcessors.forEach(busyProcessor => {
                if(busyProcessor.writing) {
                    busyProcessor.actionsList.push(`W${busyProcessor.writing}`);
                } else {
                    busyProcessor.actionsList.push(busyProcessor.computing);
                }
            });

            this.startWriting(updatedQueue, freeBanks, freeProcessors, queueIds, edges, tact);

            this.startComputing(updatedQueue, updatedProcessors, tact);

            const freeProcessorsAfterAll = updatedProcessors.filter(processor => processor.isFree);
            freeProcessorsAfterAll.forEach(freeProcessor => {
                freeProcessor.actionsList.push('_')
            });

            this.stopProcess({
                updatedQueue,
                updatedProcessors,
                updatedBanks,
                tact,
                startedField: 'writeStarted',
                finishedField: 'writeFinished',
                weight: 'tactsToWrite',
                isDoneField: 'isWritten',
                processing: 'writing',
                callback: (id) => banksData.push(id)
            });

            this.stopProcess({
                updatedQueue,
                updatedProcessors,
                tact,
                startedField: 'started',
                finishedField: 'finished',
                weight: 'weight',
                isDoneField: 'isComputed',
                processing: 'computing'
            });

            console.log(updatedProcessors.map(p => p.isFree));

            // Increment tact and update queue is state
            this.setState({
                tact: this.state.tact + 1,
                queue: updatedQueue,
                processors: updatedProcessors
            });
        } else {
            console.log('processors after computing', processors);
        }

        console.log('updatedQueue', updatedQueue);
    }


    render() {
        return (
          <div className={'planning'}>
              {this.state.processors.map(processor => {
                  return <div>
                      {processor.actionsList.map(action => {
                          return <span>{action}  </span>
                      })}
                  </div>
              })}
              <br/>
              <br/>
              {this.state.banks.map(bank => {
                  return <div>
                      {bank.actionsList.map(action => {
                          return <span>{action}</span>
                      })}
                  </div>
              })}
          </div>
        )
    }
}