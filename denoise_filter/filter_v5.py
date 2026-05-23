import cv2
import numpy as np

CLAHE, Sobel edge detection, sharpening을 결합한 이미지 필터링 파이프라인
def boost_objects(img):

    # LAB 색공간으로 변환
    # L 채널(밝기)만 조정하면 색 왜곡을 줄일 수 있음
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    # CLAHE 적용
    # 이미지의 지역 대비(local contrast)를 향상시켜
    # 어두운 영역의 디테일을 더 잘 보이게 함
    clahe = cv2.createCLAHE(clipLimit=5.0, tileGridSize=(8,8))
    l = clahe.apply(l)

    # 향상된 밝기 채널을 다시 합치기
    img = cv2.merge((l, a, b))
    img = cv2.cvtColor(img, cv2.COLOR_LAB2BGR)

    # Sobel edge detection을 위해 grayscale 변환
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # x축 / y축 방향 gradient 계산
    grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)

    # gradient magnitude 계산
    # 객체 경계(edge)를 강조
    edges = cv2.magnitude(grad_x, grad_y)

    # edge 값을 0~255 범위로 정규화
    edges = cv2.normalize(edges, None, 0, 255, cv2.NORM_MINMAX)
    edges = edges.astype(np.uint8)

    # grayscale edge 이미지를 3채널로 변환
    edges_3ch = cv2.merge([edges, edges, edges])

    # 원본 이미지와 edge 정보를 합성하여
    # 객체 윤곽을 강조
    boosted = cv2.addWeighted(img, 1.0, edges_3ch, 0.6, 0)

    # Gaussian blur 기반 sharpening (unsharp masking)
    blur = cv2.GaussianBlur(boosted, (0,0), 2)
    final = cv2.addWeighted(boosted, 1.4, blur, -0.4, 0)

    return final


# 입력 이미지 로드
img = cv2.imread("2.png")

# 이미지가 존재하지 않을 경우 예외 처리
if img is None:
    raise ValueError("Image not found!")

# 필터 적용
output = boost_objects(img)

# 결과 저장 및 출력
cv2.imwrite("boosted_objects.jpg", output)
cv2.imshow("Object Boost", output)

cv2.waitKey(0)
cv2.destroyAllWindows()
