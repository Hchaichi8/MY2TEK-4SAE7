#include "premiere.h"

class premiereData : public QSharedData
{
public:

};

premiere::premiere() : data(new premiereData)
{

}

premiere::premiere(const premiere &rhs) : data(rhs.data)
{

}

premiere &premiere::operator=(const premiere &rhs)
{
    if (this != &rhs)
        data.operator=(rhs.data);
    return *this;
}

premiere::~premiere()
{

}
