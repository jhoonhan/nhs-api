import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

# Create a new figure
fig, ax = plt.subplots(figsize=(10, 6))

# Define the positions and sizes of the components
components = {
    "Elastic Beanstalk": (2, 6, 2, 1),
    "Load Balancer": (2, 4, 2, 1),
    "Amazon S3\n(Static Website)": (6, 4, 2, 1),
    "RDS\n(Database)": (2, 2, 2, 1)
}

# Draw rectangles and labels for each component
for component, (x, y, width, height) in components.items():
    ax.add_patch(Rectangle((x, y), width, height, edgecolor='blue', facecolor='lightgrey'))
    ax.text(x + width / 2, y + height / 2, component, ha='center', va='center', fontsize=10, weight='bold')

# Draw arrows to show the flow
arrows = [
    ((3, 6), (3, 5)),  # Elastic Beanstalk to Load Balancer
    ((3, 4), (3, 3)),  # Load Balancer to RDS
    ((4, 4.5), (6, 4.5)),  # Load Balancer to Amazon S3
]

for start, end in arrows:
    ax.annotate('', xy=end, xytext=start, arrowprops=dict(facecolor='black', shrink=0.05))

# Set limits and hide axes
ax.set_xlim(0, 10)
ax.set_ylim(0, 8)
ax.axis('off')

# Show the flowchart
plt.title('Flowchart: Web Application with AWS Components', fontsize=14, weight='bold')
plt.show()
