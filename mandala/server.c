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
#define MAX_PATH 512

int server_fd;

void handle_sigint(int sig) {
    printf("\n[INFO] Shutting down server...\n");
    close(server_fd);
    exit(0);
}

const char* get_mime_type(const char* path) {
    const char* ext = strrchr(path, '.');
    if (!ext) return "text/plain";
    
    if (strcmp(ext, ".html") == 0) return "text/html";
    if (strcmp(ext, ".js") == 0) return "application/javascript";
    if (strcmp(ext, ".wasm") == 0) return "application/wasm";
    if (strcmp(ext, ".css") == 0) return "text/css";
    if (strcmp(ext, ".png") == 0) return "image/png";
    if (strcmp(ext, ".jpg") == 0 || strcmp(ext, ".jpeg") == 0) return "image/jpeg";
    if (strcmp(ext, ".json") == 0) return "application/json";
    if (strcmp(ext, ".data") == 0) return "application/octet-stream";
    
    return "application/octet-stream";
}

void send_file(int client_socket, const char* filepath) {
    struct stat file_stat;
    
    // Check if file exists
    if (stat(filepath, &file_stat) < 0) {
        // Try index.html if it's a directory or root
        char index_path[MAX_PATH];
        snprintf(index_path, sizeof(index_path), "%s/index.html", filepath);
        
        if (stat(index_path, &file_stat) == 0) {
            send_file(client_socket, index_path);
            return;
        }
        
        // Send 404
        const char* not_found = 
            "HTTP/1.1 404 Not Found\r\n"
            "Content-Type: text/html\r\n"
            "Content-Length: 58\r\n"
            "Connection: close\r\n"
            "\r\n"
            "<html><body><h1>404 - File Not Found</h1></body></html>\n";
        write(client_socket, not_found, strlen(not_found));
        return;
    }
    
    // Open file
    int file_fd = open(filepath, O_RDONLY);
    if (file_fd < 0) {
        const char* error = 
            "HTTP/1.1 500 Internal Server Error\r\n"
            "Content-Length: 21\r\n"
            "Connection: close\r\n"
            "\r\n"
            "Internal Server Error";
        write(client_socket, error, strlen(error));
        return;
    }
    
    // Send HTTP headers
    char header[BUFFER_SIZE];
    snprintf(header, sizeof(header),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: %s\r\n"
        "Content-Length: %ld\r\n"
        "Cache-Control: no-cache\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Connection: close\r\n"
        "\r\n",
        get_mime_type(filepath),
        file_stat.st_size
    );
    write(client_socket, header, strlen(header));
    
    // Send file content
    char buffer[BUFFER_SIZE];
    ssize_t bytes_read;
    while ((bytes_read = read(file_fd, buffer, sizeof(buffer))) > 0) {
        write(client_socket, buffer, bytes_read);
    }
    
    close(file_fd);
}

void handle_request(int client_socket) {
    char buffer[BUFFER_SIZE];
    ssize_t bytes_read = read(client_socket, buffer, sizeof(buffer) - 1);
    
    if (bytes_read <= 0) {
        close(client_socket);
        return;
    }
    
    buffer[bytes_read] = '\0';
    
    // Parse HTTP request
    char method[16], path[MAX_PATH], version[16];
    if (sscanf(buffer, "%15s %511s %15s", method, path, version) != 3) {
        close(client_socket);
        return;
    }
    
    // Only handle GET requests
    if (strcmp(method, "GET") != 0) {
        const char* not_allowed = 
            "HTTP/1.1 405 Method Not Allowed\r\n"
            "Content-Length: 0\r\n"
            "Connection: close\r\n"
            "\r\n";
        write(client_socket, not_allowed, strlen(not_allowed));
        close(client_socket);
        return;
    }
    
    // Build file path
    char filepath[MAX_PATH];
    if (strcmp(path, "/") == 0) {
        snprintf(filepath, sizeof(filepath), "web/index.html");
    } else {
        // Remove leading slash and prepend web/
        snprintf(filepath, sizeof(filepath), "web%s", path);
    }
    
    printf("[%s] %s\n", method, filepath);
    
    // Send file
    send_file(client_socket, filepath);
    close(client_socket);
}

int main(int argc, char* argv[]) {
    int port = PORT;
    
    if (argc > 1) {
        port = atoi(argv[1]);
        if (port <= 0 || port > 65535) {
            printf("Invalid port number. Using default %d\n", PORT);
            port = PORT;
        }
    }
    
    // Register signal handler for graceful shutdown
    signal(SIGINT, handle_sigint);
    
    // Create socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        perror("Socket creation failed");
        return 1;
    }
    
    // Allow socket reuse
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt))) {
        perror("Setsockopt failed");
        return 1;
    }
    
    // Bind socket
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);
    
    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        perror("Bind failed");
        return 1;
    }
    
    // Listen for connections
    if (listen(server_fd, 10) < 0) {
        perror("Listen failed");
        return 1;
    }
    
    printf("=================================\n");
    printf("  Mandala Web Server Running\n");
    printf("=================================\n");
    printf("Serving: ./web/\n");
    printf("URL: http://localhost:%d\n", port);
    printf("Press Ctrl+C to stop\n\n");
    
    // Accept connections
    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        
        int client_socket = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client_socket < 0) {
            perror("Accept failed");
            continue;
        }
        
        // Handle request (in production, you'd fork or use threads)
        handle_request(client_socket);
    }
    
    close(server_fd);
    return 0;
}