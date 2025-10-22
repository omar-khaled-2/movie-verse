resource "aws_iam_role" "cluster" {

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      },
    ]
  })
}




resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}


resource "aws_eks_cluster" "cluster" {
    name = "movie-verse-cluster"

    role_arn = aws_iam_role.cluster.arn
    vpc_config {
      subnet_ids = var.private_subnet_ids
    }
    depends_on = [ aws_iam_role.cluster ]
}


resource "aws_iam_role" "ec2_node_group" {
  name = "movie-verse-eks-node-group-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}


resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  role       = aws_iam_role.ec2_node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}


resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  role       = aws_iam_role.ec2_node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2_node_group.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}


resource "aws_eks_node_group" "movie_verse_nodes" {
  cluster_name    = aws_eks_cluster.cluster.name
  node_group_name = "movie-verse-nodes"
  node_role_arn   = aws_iam_role.ec2_node_group.arn

  subnet_ids = var.private_subnet_ids
  depends_on = [ aws_iam_role.ec2_node_group ]
  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  
  instance_types = ["t3.medium"]


  labels = {
    environment = "movie-verse"
  }


  tags = {
    Name = "movie-verse-node"
  }
}



