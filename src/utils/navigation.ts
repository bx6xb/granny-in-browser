import * as THREE from 'three';
import { Pathfinding } from 'three-pathfinding';

export class NavigationSystem {
  private pathfinding: Pathfinding;
  private zone: string = 'haunted-house';
  private navMesh: THREE.Mesh | null = null;

  constructor() {
    this.pathfinding = new Pathfinding();
  }

  setNavMesh(mesh: THREE.Mesh) {
    this.navMesh = mesh;
    console.log('Setting navmesh:', mesh);
    console.log('Navmesh position:', mesh.position);
    console.log('Navmesh geometry:', mesh.geometry);

    // Clone geometry and apply mesh position
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);

    const zone = Pathfinding.createZone(geometry);
    console.log('Zone created:', zone);
    this.pathfinding.setZoneData(this.zone, zone);
  }

  getRandomPointOnNavMesh(): THREE.Vector3 | null {
    if (!this.navMesh) {
      console.log('No navmesh set!');
      return null;
    }

    const geometry = this.navMesh.geometry;
    const position = geometry.attributes.position;
    const faces = geometry.index;

    if (!faces) {
      console.log('No faces in navmesh geometry!');
      return null;
    }

    // Calculate triangle areas for weighted random selection
    const triangleAreas: number[] = [];
    let totalArea = 0;

    for (let i = 0; i < faces.count; i += 3) {
      const i0 = faces.getX(i);
      const i1 = faces.getX(i + 1);
      const i2 = faces.getX(i + 2);

      const v0 = new THREE.Vector3(position.getX(i0), position.getY(i0), position.getZ(i0));
      const v1 = new THREE.Vector3(position.getX(i1), position.getY(i1), position.getZ(i1));
      const v2 = new THREE.Vector3(position.getX(i2), position.getY(i2), position.getZ(i2));

      const edge1 = new THREE.Vector3().subVectors(v1, v0);
      const edge2 = new THREE.Vector3().subVectors(v2, v0);
      const area = edge1.cross(edge2).length() * 0.5;

      triangleAreas.push(area);
      totalArea += area;
    }

    // Select random triangle weighted by area
    let random = Math.random() * totalArea;
    let selectedTriangle = 0;

    for (let i = 0; i < triangleAreas.length; i++) {
      random -= triangleAreas[i];
      if (random <= 0) {
        selectedTriangle = i;
        break;
      }
    }

    // Get vertices of selected triangle
    const i0 = faces.getX(selectedTriangle * 3);
    const i1 = faces.getX(selectedTriangle * 3 + 1);
    const i2 = faces.getX(selectedTriangle * 3 + 2);

    const v0 = new THREE.Vector3(position.getX(i0), position.getY(i0), position.getZ(i0));
    const v1 = new THREE.Vector3(position.getX(i1), position.getY(i1), position.getZ(i1));
    const v2 = new THREE.Vector3(position.getX(i2), position.getY(i2), position.getZ(i2));

    // Apply navmesh world matrix to vertices
    v0.applyMatrix4(this.navMesh.matrixWorld);
    v1.applyMatrix4(this.navMesh.matrixWorld);
    v2.applyMatrix4(this.navMesh.matrixWorld);

    // Random point in triangle using barycentric coordinates
    let r1 = Math.random();
    let r2 = Math.random();

    if (r1 + r2 > 1) {
      r1 = 1 - r1;
      r2 = 1 - r2;
    }

    const point = new THREE.Vector3();
    point.addScaledVector(v0, 1 - r1 - r2);
    point.addScaledVector(v1, r1);
    point.addScaledVector(v2, r2);

    return point;
  }

  findPath(start: THREE.Vector3, target: THREE.Vector3): THREE.Vector3[] {
    const zone = this.zone;

    // 1. Находим группы (используем true для поиска ближайшей, если точка вне меша)
    const startGroupID = this.pathfinding.getGroup(zone, start);
    const targetGroupID = this.pathfinding.getGroup(zone, target);

    const groupID = targetGroupID !== null ? targetGroupID : startGroupID;
    if (groupID === null) return [];

    // 2. Находим ближайшие ноды
    const startNode = this.pathfinding.getClosestNode(start, zone, groupID);
    const targetNode = this.pathfinding.getClosestNode(target, zone, groupID);

    if (!startNode || !targetNode) return [];

    // 3. Функция для "вталкивания" точки внутрь меша
    const getSafePoint = (point: THREE.Vector3, node: any) => {
      // node.centroid - это либо Vector3, либо массив [x, y, z] в зависимости от версии
      const centroid = Array.isArray(node.centroid)
        ? new THREE.Vector3(node.centroid[0], node.centroid[1], node.centroid[2])
        : node.centroid;

      const safePoint = point.clone();

      // Снапим Y к высоте центроида, чтобы не было "висения" в воздухе
      safePoint.y = centroid.y;

      // Сдвигаем точку на 2см к центру треугольника, чтобы уйти от края
      const toCentroid = new THREE.Vector3()
        .subVectors(centroid, safePoint)
        .normalize()
        .multiplyScalar(0.02);

      return safePoint.add(toCentroid);
    };

    const safeStart = getSafePoint(start, startNode);
    const safeTarget = getSafePoint(target, targetNode);

    // 4. Основная попытка поиска
    let path = this.pathfinding.findPath(safeStart, safeTarget, zone, groupID);

    // 5. Если все равно null (крайне редкий случай теперь), пробуем по центроидам
    if (!path) {
      const startCentroid = Array.isArray(startNode.centroid)
        ? new THREE.Vector3().fromArray(startNode.centroid)
        : startNode.centroid;
      const targetCentroid = Array.isArray(targetNode.centroid)
        ? new THREE.Vector3().fromArray(targetNode.centroid)
        : targetNode.centroid;

      path = this.pathfinding.findPath(startCentroid, targetCentroid, zone, groupID);
    }

    return path || [];
  }

  getClosestNode(position: THREE.Vector3): THREE.Vector3 {
    const groupID = this.pathfinding.getGroup(this.zone, position);
    return this.pathfinding.getClosestNode(position, this.zone, groupID);
  }

  getClosestPointOnNavMesh(position: THREE.Vector3): THREE.Vector3 {
    if (!this.navMesh) {
      console.log('No navmesh set!');
      return position;
    }

    const geometry = this.navMesh.geometry;
    const positionAttr = geometry.attributes.position;
    const faces = geometry.index;

    if (!faces) {
      console.log('No faces in navmesh geometry!');
      return position;
    }

    const closestPoint = new THREE.Vector3();
    let minDistance = Infinity;

    // Check all triangles in navmesh
    for (let i = 0; i < faces.count; i += 3) {
      const i0 = faces.getX(i);
      const i1 = faces.getX(i + 1);
      const i2 = faces.getX(i + 2);

      const v0 = new THREE.Vector3(
        positionAttr.getX(i0),
        positionAttr.getY(i0),
        positionAttr.getZ(i0)
      );
      const v1 = new THREE.Vector3(
        positionAttr.getX(i1),
        positionAttr.getY(i1),
        positionAttr.getZ(i1)
      );
      const v2 = new THREE.Vector3(
        positionAttr.getX(i2),
        positionAttr.getY(i2),
        positionAttr.getZ(i2)
      );

      // Apply navmesh world matrix
      v0.applyMatrix4(this.navMesh.matrixWorld);
      v1.applyMatrix4(this.navMesh.matrixWorld);
      v2.applyMatrix4(this.navMesh.matrixWorld);

      // Find closest point on triangle
      const triangle = new THREE.Triangle(v0, v1, v2);
      const point = new THREE.Vector3();
      triangle.closestPointToPoint(position, point);

      const distance = position.distanceTo(point);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint.copy(point);
      }
    }

    return closestPoint;
  }
}

export const navigationSystem = new NavigationSystem();
