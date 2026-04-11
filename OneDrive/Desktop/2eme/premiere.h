#ifndef PREMIERE_H
#define PREMIERE_H

#include <QDeclarativeItem>
#include <QMainWindow>
#include <QObject>
#include <QQuickItem>
#include <QSharedDataPointer>
#include <QWidget>

class premiereData;

class premiere
{
    Q_OBJECT
public:
    premiere();
    premiere(const premiere &);
    premiere &operator=(const premiere &);
    ~premiere();

private:
    QSharedDataPointer<premiereData> data;
};

#endif // PREMIERE_H
