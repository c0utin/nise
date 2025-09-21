#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <signal.h>

#define PORT 8080
#define BUFFER_SIZE 4096
#define MAX_PATH 256

int server_fd = -1;

void handle_sigint(int sig) {
    printf("\n[INFO] Shutting down server...\n");
    if (server_fd != -1) {
        close(server_fd);
    }
    exit(0);
}

const char* get_content_type(const char* path) {
    const char* ext = strrchr(path, '.');
    if (!ext) return "text/plain";
    
    if (strcmp(ext, ".html") == 0) return "text/html";
    if (strcmp(ext, ".css") == 0) return "text/css";
    if (strcmp(ext, ".js") == 0) return "application/javascript";
    if (strcmp(ext, ".wasm") == 0) return "application/wasm";
    if (strcmp(ext, ".png") == 0) return "image/png";
    if (strcmp(ext, ".jpg") == 0 || strcmp(ext, ".jpeg") == 0) return "image/jpeg";
    if (strcmp(ext, ".gif") == 0) return "image/gif";
    if (strcmp(ext, ".ico") == 0) return "image/x-icon";
    if (strcmp(ext, ".json") == 0) return "application/json";
    
    return "application/octet-stream";
}

void send_404(int client_fd) {
    const char* response = 
        "HTTP/1.1 404 Not Found\r\n"
        "Content-Type: text/html\r\n"
        "Content-Length: 160\r\n"
        "\r\n"
        "<html><head><title>404 Not Found</title></head>"
        "<body style='text-align:center;font-family:sans-serif;'>"
        "<h1>404 Not Found</h1><p>The requested file was not found.</p>"
        "</body></html>";
    
    send(client_fd, response, strlen(response), 0);
}

void send_file(int client_fd, const char* filepath) {
    struct stat st;
    if (stat(filepath, &st) != 0) {
        send_404(client_fd);
        return;
    }
    
    int file_fd = open(filepath, O_RDONLY);
    if (file_fd < 0) {
        send_404(client_fd);
        return;
    }
    
    // Send HTTP headers
    char header[BUFFER_SIZE];
    snprintf(header, sizeof(header),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %ld\r\n"
        "Cache-Control: public, max-age=3600\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "\r\n",
        get_content_type(filepath),
        st.st_size);
    
    send(client_fd, header, strlen(header), 0);
    
    // Send file content
    char buffer[BUFFER_SIZE];
    ssize_t bytes;
    while ((bytes = read(file_fd, buffer, sizeof(buffer))) > 0) {
        send(client_fd, buffer, bytes, 0);
    }
    
    close(file_fd);
}

void handle_request(int client_fd) {
    char buffer[BUFFER_SIZE] = {0};
    recv(client_fd, buffer, BUFFER_SIZE - 1, 0);
    
    // Parse the request line
    char method[16], path[MAX_PATH], version[16];
    sscanf(buffer, "%s %s %s", method, path, version);
    
    // Only handle GET requests
    if (strcmp(method, "GET") != 0) {
        const char* response = 
            "HTTP/1.1 405 Method Not Allowed\r\n"
            "Content-Length: 0\r\n"
            "\r\n";
        send(client_fd, response, strlen(response), 0);
        return;
    }
    
    // Sanitize path
    char filepath[MAX_PATH];
    if (strcmp(path, "/") == 0) {
        strcpy(filepath, "index.html");
    } else {
        // Remove leading slash
        snprintf(filepath, sizeof(filepath), ".%s", path);
    }
    
    // Security: prevent directory traversal
    if (strstr(filepath, "..") != NULL) {
        send_404(client_fd);
        return;
    }
    
    printf("[%s] %s %s -> %s\n", 
        method, 
        path, 
        filepath,
        get_content_type(filepath));
    
    send_file(client_fd, filepath);
}

int main() {
    struct sockaddr_in address;
    int addrlen = sizeof(address);
    
    // Handle Ctrl+C gracefully
    signal(SIGINT, handle_sigint);
    
    // Create socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("Socket failed");
        exit(EXIT_FAILURE);
    }
    
    // Allow socket reuse
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
        perror("Setsockopt failed");
        exit(EXIT_FAILURE);
    }
    
    // Configure address
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);
    
    // Bind socket
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("Bind failed");
        exit(EXIT_FAILURE);
    }
    
    // Listen for connections
    if (listen(server_fd, 10) < 0) {
        perror("Listen failed");
        exit(EXIT_FAILURE);
    }
    
    printf("=====================================\n");
    printf("   Nise - Portfolio Server\n");
    printf("=====================================\n");
    printf("[INFO] Server running on http://localhost:%d\n", PORT);
    printf("[INFO] Serving index.html by default\n");
    printf("[INFO] Press Ctrl+C to stop\n");
    printf("=====================================\n\n");
    
    // Main server loop
    while (1) {
        int client_fd = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen);
        if (client_fd < 0) {
            perror("Accept failed");
            continue;
        }
        
        handle_request(client_fd);
        close(client_fd);
    }
    
    return 0;
}