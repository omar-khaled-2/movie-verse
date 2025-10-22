resource "aws_vpc" "main" {
    cidr_block = "10.0.0.0/16"
    
    tags = {
        Name = "main"
    }
}


resource "aws_subnet" "public" {
    cidr_block = "10.0.1.0/24"
    vpc_id = aws_vpc.main.id
    availability_zone = "us-east-1a"
    count = 1
}

resource "aws_subnet" "public_2" {
    cidr_block = "10.0.8.0/24"
    vpc_id = aws_vpc.main.id
    availability_zone = "us-east-1b"
   
}



resource "aws_subnet" "private" {
    count = 2

    vpc_id = aws_vpc.main.id
    cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + length(aws_subnet.public[*].id) + 1)
    availability_zone = element(["us-east-1a","us-east-1b"], count.index)
}


resource "aws_internet_gateway" "internet_gateway" {
    vpc_id = aws_vpc.main.id
    
}

resource "aws_route_table" "public" {
    vpc_id = aws_vpc.main.id

}

resource "aws_route" "public_internet_access" {
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.internet_gateway.id
  route_table_id = aws_route_table.public.id

}

resource "aws_route_table_association" "public_assoc" {
  count = 1
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_assoc_2" {

  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_eip" "nat" {
  
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

}
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route" "private_nat" {

  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat.id
}



resource "aws_route_table_association" "private_assoc" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}