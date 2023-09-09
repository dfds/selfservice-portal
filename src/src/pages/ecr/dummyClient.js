// Mocking a client with unknown definition.

// Repositories contains: name, description, uri, createdAt, createdBy, status
let repositoriesData = [
    {"id": 1, "name": "test-repo-1", "description": "This is a test 1", "uri": "uri://test-repo-1", "createdAt": "24-12-2000 00:00:00", "createdBy": "test-user-1", "status": "active"},
    {"id": 2, "name": "test-repo-2", "description": "This is a test 2", "uri": "uri://test-repo-2", "createdAt": "24-12-2000 00:00:00", "createdBy": "test-user-2", "status": "active"},
    {"id": 3, "name": "test-repo-3", "description": "This is a test 3", "uri": "uri://test-repo-3", "createdAt": "24-12-2000 00:00:00", "createdBy": "test-user-3", "status": "active"},
];


const finalizeCreation = (id) => {
    const repository = repositoriesData.find((repo) => repo.id === id);
    if (repository) {
        repository.status = "active";
        repository.uri = `uri://${repository.name}`;    
    }
};

export const getRepositories = async () => {
    console.log("Returning repositories: " + repositoriesData.length + " items.")
    return repositoriesData;
};

// createRepositoryDto contains: name, description, createdBy
export const addRepository = async (createRepositoryDto) => {
    const newid = repositoriesData.length + 1;
    const repository = {
        ...createRepositoryDto,
        id: newid,
        createdAt: new Date().toISOString(),
        status: "pending",
    };
    repositoriesData.push(repository);
    setTimeout(() => { // fake some latency
        console.log("Finalizing creation...");
        finalizeCreation(newid);
    }, 7000);
};
