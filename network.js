class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        const speed = 0.3;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.speed = speed;
        this.radius = 3;
    }

    update(width, height) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
}

class NetworkAnimation {
    constructor() {
        this.canvas = document.getElementById('networkCanvas');
        if (!this.canvas || !this.canvas.getContext) {
            console.error('Canvas not supported in this browser');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('2D context not supported');
            return;
        }
        
        console.log('Canvas initialized successfully');
        this.nodes = [];
        this.numberOfNodes = 80;
        this.maxDistance = 150;
        this.mouseX = null;
        this.mouseY = null;
        this.pushRadius = 100;
        this.pushStrength = 5;
        this.init();
        this.animate = this.animate.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        requestAnimationFrame(this.animate);
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);

        // Create initial nodes
        for (let i = 0; i < this.numberOfNodes; i++) {
            this.nodes.push(new Node(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    drawConnections() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';

        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.maxDistance) {
                    const opacity = 1 - (distance / this.maxDistance);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawNodes() {
        // Draw push radius when mouse is present
        if (this.mouseX !== null && this.mouseY !== null) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, this.pushRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.stroke();
        }
        
        // Draw nodes
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;
        console.log('Mouse position:', this.mouseX, this.mouseY);
    }

    handleMouseLeave() {
        this.mouseX = null;
        this.mouseY = null;
    }

    updateNodePositions() {
        this.nodes.forEach(node => {
            if (this.mouseX !== null && this.mouseY !== null) {
                const dx = this.mouseX - node.x;
                const dy = this.mouseY - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Only affect nodes within the push radius
                if (distance < this.pushRadius && distance > 0) {
                    // Calculate push force
                    const force = (this.pushRadius - distance) / this.pushRadius * this.pushStrength;
                    // Add to current velocity instead of replacing it
                    node.vx += (-dx / distance) * force;
                    node.vy += (-dy / distance) * force;
                } else {
                    // Gradually return to original speed
                    node.vx *= 0.95;
                    node.vy *= 0.95;
                    if (Math.abs(node.vx) < node.speed) {
                        node.vx += (Math.random() - 0.5) * 0.1;
                    }
                    if (Math.abs(node.vy) < node.speed) {
                        node.vy += (Math.random() - 0.5) * 0.1;
                    }
                }
            }

            node.update(this.canvas.width, this.canvas.height);
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateNodePositions();

        // Draw connections and nodes
        this.drawConnections();
        this.drawNodes();

        requestAnimationFrame(this.animate);
    }
}

// Initialize the animation when the page loads
window.addEventListener('load', () => {
    new NetworkAnimation();
}); 