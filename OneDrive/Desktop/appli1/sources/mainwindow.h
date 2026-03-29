#ifndef MAIN_H
#define MAIN_H

#include <QMainWindow>
#include <QObject>
#include <QWidget>

class main : public QMainWindow
{
    Q_OBJECT
public:
    explicit main(QWidget *parent = nullptr);

signals:

};

#endif // MAIN_H
