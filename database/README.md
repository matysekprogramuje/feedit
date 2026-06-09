# feedit

A Java-based backend application built with Spring Boot for managing and processing feed data.

## Overview

**feedit** is a Spring Boot application designed to handle feed operations. The project uses modern Java development practices with Spring Boot 4.0.6 and Gradle as the build tool.

## Technology Stack

- **Language**: Java 17
- **Framework**: Spring Boot 4.0.6
- **Build Tool**: Gradle 9.5.1
- **Dependency Management**: Spring Dependency Management 1.1.7

## Prerequisites

- Java 17 or higher
- Gradle 9.5.1 (or use the included Gradle wrapper)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/matysekprogramuje/feedit.git
cd feedit
```

2. Navigate to the backend directory:
```bash
cd feeditbackend
```

### Building the Project

Using the Gradle wrapper:

**On Linux/macOS:**
```bash
./gradlew build
```

**On Windows:**
```bash
gradlew.bat build
```

### Running the Application

```bash
./gradlew bootRun
```

The application will start and be available at `http://localhost:8080` (default Spring Boot port).

## Project Structure

```
feedit/
├── feeditbackend/          # Spring Boot backend application
│   ├── build.gradle        # Gradle build configuration
│   ├── gradlew             # Gradle wrapper (Linux/macOS)
│   ├── gradlew.bat         # Gradle wrapper (Windows)
│   └── gradle/wrapper/     # Gradle wrapper files
```

## Dependencies

### Runtime Dependencies
- `spring-boot-starter-webmvc` - Spring Web MVC support

### Test Dependencies
- `spring-boot-starter-webmvc-test` - Web MVC testing utilities
- `junit-platform-launcher` - JUnit 5 test platform

## Testing

Run the test suite:

```bash
./gradlew test
```

## Configuration

- Default Java compiler: Java 17
- Source/Target Compatibility: Java 17
- Default JVM options: `-Xmx64m -Xms64m`

## License

Not yet specified. Consider adding a LICENSE file.

---

**Status**: Early development (Version 0.0.1-SNAPSHOT)
