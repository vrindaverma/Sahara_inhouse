import json
import os
import networkx as nx


class DependencyGraphEngine:

    def __init__(self):
        self.graph = nx.DiGraph()

        # Store graph data outside the Python process
        self.data_file = os.path.join(
            os.path.dirname(__file__),
            "graph_data.json"
        )

        self.load_graph()

    # ---------------------------------------------------------
    # Load graph from JSON when backend starts
    # ---------------------------------------------------------
    def load_graph(self):
        if not os.path.exists(self.data_file):
            print("[GRAPH] No saved graph found. Starting empty graph.")
            return

        try:
            with open(self.data_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.graph = nx.node_link_graph(
                data,
                directed=True
            )

            print(
                f"[GRAPH] Loaded graph: "
                f"{self.graph.number_of_nodes()} nodes, "
                f"{self.graph.number_of_edges()} edges"
            )

        except Exception as e:
            print(f"[GRAPH] Failed to load saved graph: {e}")
            self.graph = nx.DiGraph()

    # ---------------------------------------------------------
    # Save graph to JSON
    # ---------------------------------------------------------
    def save_graph(self):
        try:
            data = nx.node_link_data(self.graph)

            with open(
                self.data_file,
                "w",
                encoding="utf-8"
            ) as f:
                json.dump(
                    data,
                    f,
                    indent=2
                )

            print(
                f"[GRAPH] Saved graph: "
                f"{self.graph.number_of_nodes()} nodes, "
                f"{self.graph.number_of_edges()} edges"
            )

        except Exception as e:
            print(f"[GRAPH] Failed to save graph: {e}")

    # ---------------------------------------------------------
    # Add dependency
    # ---------------------------------------------------------
    def add_dependency(
        self,
        owner: str,
        responsibility: str,
        dependent: str
    ):
        """
        Adds:

            owner
              ↓
        responsibility
              ↓
          dependent
        """

        # Add person node
        self.graph.add_node(
            owner,
            type="person"
        )

        # Add responsibility/asset node
        self.graph.add_node(
            responsibility,
            type="asset_or_task"
        )

        # Add dependent person node
        self.graph.add_node(
            dependent,
            type="person"
        )

        # Create dependency flow
        self.graph.add_edge(
            owner,
            responsibility
        )

        self.graph.add_edge(
            responsibility,
            dependent
        )

        # Persist graph
        self.save_graph()

    # ---------------------------------------------------------
    # Detect single points of failure
    # ---------------------------------------------------------
    def detect_single_points_of_failure(self) -> list:

        if self.graph.number_of_nodes() < 3:
            return []

        undirected_copy = self.graph.to_undirected()

        spof_nodes = list(
            nx.articulation_points(
                undirected_copy
            )
        )

        return spof_nodes

    # ---------------------------------------------------------
    # Export graph for React Flow
    # ---------------------------------------------------------
    def export_graph_json(self) -> dict:

        nodes = []

        for node_id in self.graph.nodes():

            node_type = self.graph.nodes[node_id].get(
                "type",
                "default"
            )

            nodes.append({
                "id": str(node_id),
                "label": str(node_id),
                "type": node_type
            })

        edges = []

        for source, target in self.graph.edges():

            edges.append({
                "id": f"{source}-{target}",
                "source": str(source),
                "target": str(target)
            })

        return {
            "nodes": nodes,
            "edges": edges
        }


# -------------------------------------------------------------
# Global graph instance
# -------------------------------------------------------------
global_graph_service = DependencyGraphEngine()