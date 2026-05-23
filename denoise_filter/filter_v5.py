import cv2
import numpy as np

def boost_objects(img):
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

if __name__ == "__main__":
    img = cv2.imread("2.png")

    if img is None:
        raise ValueError("Image not found!")

    output = boost_objects(img)

    cv2.imwrite("boosted_objects.jpg", output)
    cv2.imshow("Object Boost", output)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
