# King's Raid Info

A web application that provides a number of data from the mobile game King's Raid.

## Data and 3D Model Files

**Note:** Data, illustrations are stored in [kingsraid-data](https://github.com/faberuser/kingsraid-data) and 3D model files in a separate private/personal Git server [kingsraid-models](https://gitea.k-clowd.top/faberuser/kingsraid-models) due to their large size.

By cloning this repo with `--recurse-submodules` or do `git submodule update` will clone both data and models repos into your machine.

## Getting Started

### Prerequisites

-   [Bun](https://bun.sh/)
-   Git

### Installation

1. Clone the repository with submodules:

```bash
git clone --recurse-submodules https://github.com/faberuser/kingsraid.git
cd kingsraid
```

2. If already cloned without submodules, initialize them:

```bash
git submodule update --init --recursive
```

3. Install dependencies:

```bash
bun install
```

4. Run the development server:

```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

The application can be deployed using Docker:

1. Build the image:

```bash
docker build -t kingsraid .
```

2. Run the container:

```bash
docker run -p 3000:3000 kingsraid
```

### Using Docker Compose

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000` (or the port specified in your environment).

## Environment Variables

Create a `.env.local` file for local development:

```env
CONTAINER_NAME=kingsraid # optional
DOCKER_PORT=3000  # optional
```
