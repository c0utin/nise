CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c11
LDFLAGS = -lraylib -lm -lpthread -ldl -lrt -lX11

# Source files
SOURCES = main.c art_core.c module_mandala.c module_fractal.c
OBJECTS = $(SOURCES:.c=.o)
EXECUTABLE = art_generator

# Detect OS
UNAME_S := $(shell uname -s)

ifeq ($(UNAME_S),Linux)
    LDFLAGS += -lGL
endif

ifeq ($(UNAME_S),Darwin)
    LDFLAGS = -framework CoreVideo -framework IOKit -framework Cocoa -framework GLUT -framework OpenGL -lraylib
endif

all: $(EXECUTABLE)

$(EXECUTABLE): $(OBJECTS)
	$(CC) $(OBJECTS) -o $@ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJECTS) $(EXECUTABLE)

run: $(EXECUTABLE)
	./$(EXECUTABLE)

# For adding new modules, just add the .c file to SOURCES variable above

.PHONY: all clean run