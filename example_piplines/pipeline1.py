import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import os, cv2
import numpy as np
from ultralytics import YOLO
import time


class ImageApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Image Processor")

        self.original_image = None
        self.processed_image = None

        # 🔥 Load YOLO ONCE (important)
        self.model = YOLO("yolov8_objectdetection_library/weights/best.pt")

        self.canvas = tk.Canvas(root, width=600, height=400, bg="gray")
        self.canvas.pack()

        btn_frame = tk.Frame(root)
        btn_frame.pack(pady=10)

        tk.Button(btn_frame, text="Upload Image", command=self.upload_image).grid(row=0, column=0, padx=5)
        tk.Button(btn_frame, text="Process Image", command=self.process_image).grid(row=0, column=1, padx=5)
        tk.Button(btn_frame, text="Show Processed", command=self.show_processed).grid(row=0, column=2, padx=5)
        tk.Button(btn_frame, text="Save Original", command=self.save_original).grid(row=0, column=3, padx=5)
        tk.Button(btn_frame, text="Save Processed", command=self.save_processed).grid(row=0, column=4, padx=5)

    def boost_objects(self, img):
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        clahe = cv2.createCLAHE(clipLimit=5.0, tileGridSize=(8,8))
        l = clahe.apply(l)

        img = cv2.merge((l, a, b))
        img = cv2.cvtColor(img, cv2.COLOR_LAB2BGR)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

        edges = cv2.magnitude(grad_x, grad_y)
        edges = cv2.normalize(edges, None, 0, 255, cv2.NORM_MINMAX)
        edges = edges.astype(np.uint8)

        edges_3ch = cv2.merge([edges, edges, edges])

        boosted = cv2.addWeighted(img, 1.0, edges_3ch, 0.6, 0)

        blur = cv2.GaussianBlur(boosted, (0,0), 2)
        final = cv2.addWeighted(boosted, 1.4, blur, -0.4, 0)

        return final

    def object_detection(self, img):
        results = self.model(img)
        annotated = results[0].plot()
        return annotated

    def upload_image(self):
        path = filedialog.askopenfilename(
            filetypes=[("Image Files", "*.png *.jpg *.jpeg")]
        )
        if not path:
            return

        self.original_image = Image.open(path)
        self.display_image(self.original_image)

    def process_image(self):
        if self.original_image is None:
            messagebox.showerror("Error", "Upload an image first")
            return

        img_np = np.array(self.original_image)
        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        print("LOADED")
        boosted = self.boost_objects(img_cv)
        print("BOOSTED")
        detected = self.object_detection(boosted)
        print("DETECTED")
        detected_rgb = cv2.cvtColor(detected, cv2.COLOR_BGR2RGB)
        self.processed_image = Image.fromarray(detected_rgb)

        messagebox.showinfo("Done", "Processing complete")

    def show_processed(self):
        if self.processed_image is None:
            messagebox.showerror("Error", "Process image first")
            return

        self.display_image(self.processed_image)

    def save_original(self):
        if self.original_image is None:
            messagebox.showerror("Error", "No image to save")
            return

        folder = "test_storage"
        os.makedirs(folder, exist_ok=True)

        filename = f"original_{int(time.time())}.png"
        path = os.path.join(folder, filename)

        self.original_image.save(path)

        messagebox.showinfo("Saved", f"Saved to:\n{path}")

    def save_processed(self):
        if self.processed_image is None:
            messagebox.showerror("Error", "No processed image")
            return

        folder = "test_storage"
        os.makedirs(folder, exist_ok=True)

        filename = f"processed_{int(time.time())}.png"
        path = os.path.join(folder, filename)

        self.processed_image.save(path)

        messagebox.showinfo("Saved", f"Saved to:\n{path}")

    def display_image(self, img):
        img = img.copy()
        img.thumbnail((600, 400))

        self.tk_img = ImageTk.PhotoImage(img)
        self.canvas.create_image(300, 200, image=self.tk_img)


root = tk.Tk()
app = ImageApp(root)
root.mainloop()
