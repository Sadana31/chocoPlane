import ultralytics
print(ultralytics.__version__)

from PIL import Image
import matplotlib.pyplot as plt

img = Image.open(
    "/content/drive/MyDrive/AIRCRAFT-XAI/AIRCRAFT/DRISHTI/outputs/heatmaps/test_aircraft.jpg"
)

plt.figure(figsize=(8,8))
plt.imshow(img)
plt.axis("off")
plt.show()

import os
import matplotlib.pyplot as plt
from PIL import Image

folder = "/content/drive/MyDrive/AIRCRAFT-XAI/AIRCRAFT/DRISHTI/outputs/heatmaps"

for file in os.listdir(folder):

    img = Image.open(os.path.join(folder, file))

    plt.figure(figsize=(6,6))
    plt.imshow(img)
    plt.title(file)
    plt.axis("off")
    plt.show()

import ultralytics
print(ultralytics.__version__)

img = Image.open(
"/content/drive/MyDrive/AIRCRAFT-XAI/AIRCRAFT/DRISHTI/outputs/graphs/test_aircraft.png"
)

plt.figure(figsize=(7,5))
plt.imshow(img)
plt.axis("off")
plt.show()

from PIL import Image
import matplotlib.pyplot as plt

img = Image.open(
"/content/drive/MyDrive/AIRCRAFT-XAI/AIRCRAFT/DRISHTI/outputs/graphs/test_aircraft.png"
)

plt.figure(figsize=(7,5))
plt.imshow(img)
plt.axis("off")
plt.show()

