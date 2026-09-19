import networkx as nx

class DependencyGraphEngine:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_dependency(self, owner: str, responsibility: str, dependent: str):
        """Adds nodes and edges to the directed graph."""
        self.graph.add_node(owner, type="person")
        self.graph.add_node(responsibility, type="asset_or_task")
        self.graph.add_node(dependent, type="person")
        
        # Link owner -> responsibility -> dependent
        self.graph.add_edge(owner, responsibility)
        self.graph.add_edge(responsibility, dependent)

    def detect_single_points_of_failure(self) -> list:
        """Finds articulation points in the underlying undirected network."""
        if self.graph.number_of_nodes() < 3:
            return []
        
        undirected_copy = self.graph.to_undirected()
        spof_nodes = list(nx.articulation_points(undirected_copy))
        return spof_nodes

    def export_graph_json(self) -> dict:
        """Formats graph data for React visualization libraries (e.g., React Flow)."""
        nodes = [
            {"id": n, "label": n, "type": self.graph.nodes[n].get("type", "default")} 
            for n in self.graph.nodes()
        ]
        edges = [
            {"id": f"{u}-{v}", "source": u, "target": v} 
            for u, v in self.graph.edges()
        ]
        return {"nodes": nodes, "edges": edges}

# Global singleton instance
global_graph_service = DependencyGraphEngine()